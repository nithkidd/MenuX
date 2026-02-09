import { supabase } from '../config/supabase.js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
import fs from 'fs';
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const API_URL = `http://localhost:${process.env.PORT || 3000}/api/v1`;

// Test credentials (make sure this user exists in Supabase Auth or sign up manually first)
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTests() {
  console.log('🚀 Starting Backend Verification...');
  console.log(`Target API: ${API_URL}`);

  let token = '';
  let businessId = '';
  let categoryId = '';
  let itemId = '';
  let businessSlug = '';

  try {
    // 1. Auth: Sign Up / Sign In
    console.log('\n--- 1. Authentication ---');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signUpError) throw new Error(`SignUp failed: ${signUpError.message}`);
    console.log('✅ User Signed Up:', TEST_EMAIL);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signInError) throw new Error(`SignIn failed: ${signInError.message}`);
    token = signInData.session?.access_token || '';
    console.log('✅ User Signed In & Token received');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Business: Create
    console.log('\n--- 2. Business Module ---');
    const businessData = {
      name: 'Verification Restaurant',
      business_type: 'restaurant',
      description: 'A test restaurant for backend verification',
    };
    const createBizRes = await axios.post(`${API_URL}/business`, businessData, { headers });
    businessId = createBizRes.data.data.id;
    businessSlug = createBizRes.data.data.slug;
    console.log('✅ Business Created:', businessSlug);

    // 3. Category: Create
    console.log('\n--- 3. Category Module ---');
    const categoryData = { name: 'Starters' };
    const createCatRes = await axios.post(`${API_URL}/business/${businessId}/categories`, categoryData, { headers });
    categoryId = createCatRes.data.data.id;
    console.log('✅ Category Created:', categoryData.name);

    // 4. Item: Create
    console.log('\n--- 4. Item Module ---');
    const itemData = {
      name: 'Garlic Bread',
      price: 5.99,
      description: 'Crunchy and buttery',
    };
    const createItemRes = await axios.post(`${API_URL}/categories/${categoryId}/items`, itemData, { headers });
    itemId = createItemRes.data.data.id;
    console.log('✅ Item Created:', itemData.name);

    // 5. Public Menu: Get
    console.log('\n--- 5. Public Menu Module ---');
    const menuRes = await axios.get(`${API_URL}/menu/${businessSlug}`);
    if (menuRes.data.data.business.slug === businessSlug) {
      console.log('✅ Public Menu Fetched Successfully');
      console.log('   Category Count:', menuRes.data.data.categories.length);
      console.log('   Item Count in Category:', menuRes.data.data.categories[0].items.length);
    } else {
      console.error('❌ Data mismatch in public menu');
    }

    // 6. Cleanup (Optional: Delete Item, Category, Business)
    console.log('\n--- 6. Cleanup ---');
    await axios.delete(`${API_URL}/items/${itemId}`, { headers });
    console.log('✅ Item Deleted');
    await axios.delete(`${API_URL}/categories/${categoryId}`, { headers });
    console.log('✅ Category Deleted');
    await axios.delete(`${API_URL}/business/${businessId}`, { headers });
    console.log('✅ Business Deleted');

    console.log('\n✨ All Backend Tests Passed Successfully! ✨');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error instanceof Error ? error.message : error);
    if (axios.isAxiosError(error)) {
        console.error('Response Data:', error.response?.data);
        console.error('Status:', error.response?.status);
    }
    process.exit(1);
  }
}

runTests();
