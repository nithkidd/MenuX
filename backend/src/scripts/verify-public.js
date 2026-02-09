import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
// Load env vars using dotenv
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
console.log('Environment Check:');
console.log('- URL:', process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('- Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const API_URL = `http://localhost:${process.env.PORT || 3000}/api/v1`;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
async function verifyPublicMenu() {
    console.log('🚀 Verifying Public Menu Flow...');
    let userId = '';
    let businessId = '';
    try {
        // 1. Get or Create a User (for owner_id)
        console.log('1. Getting User...');
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        let user = users.users[0];
        if (!user) {
            console.log('   No users found, creating one...');
            const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
                email: `admin_${Date.now()}@example.com`,
                password: 'password123',
                email_confirm: true
            });
            if (error)
                throw error;
            user = newUser.user;
        }
        userId = user.id;
        console.log('   User ID:', userId);
        // 2. Create Profile if not exists
        const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('auth_user_id', userId).single();
        let profileId = profile?.id;
        if (!profileId) {
            // Profile trigger usually handles this, but let's be sure or get it
            // Wait a bit for trigger
            await new Promise(r => setTimeout(r, 2000));
            const { data: p } = await supabaseAdmin.from('profiles').select('id').eq('auth_user_id', userId).single();
            profileId = p?.id;
        }
        console.log('   Profile ID:', profileId);
        // 3. Create Business via Supabase Admin
        const slug = `verification-biz-${Date.now()}`;
        console.log(`2. Creating Business (${slug})...`);
        const { data: business, error: bizError } = await supabaseAdmin
            .from('businesses')
            .insert({
            owner_id: profileId,
            name: 'Verification Bistro',
            slug: slug,
            business_type: 'restaurant',
            is_active: true
        })
            .select()
            .single();
        if (bizError)
            throw bizError;
        businessId = business.id;
        console.log('   Business Created');
        // 4. Create Category
        console.log('3. Creating Category...');
        const { data: category, error: catError } = await supabaseAdmin
            .from('categories')
            .insert({
            business_id: businessId,
            name: 'Test Category',
            sort_order: 1
        })
            .select()
            .single();
        if (catError)
            throw catError;
        console.log('   Category Created');
        // 5. Create Item
        console.log('4. Creating Item...');
        const { error: itemError } = await supabaseAdmin
            .from('items')
            .insert({
            category_id: category.id,
            name: 'Test Item',
            price: 9.99,
            is_available: true
        });
        if (itemError)
            throw itemError;
        console.log('   Item Created');
        // 6. Verify Public API
        console.log(`5. Fetching Public API: ${API_URL}/menu/${slug}`);
        const res = await axios.get(`${API_URL}/menu/${slug}`);
        if (res.data.success && res.data.data.business.slug === slug) {
            console.log('✅ Public Menu Verified Successfully!');
            console.log('   Business Name:', res.data.data.business.name);
            console.log('   Categories:', res.data.data.categories.length);
            console.log('   Items:', res.data.data.categories[0].items.length);
        }
        else {
            throw new Error('API response validation failed');
        }
    }
    catch (error) {
        console.error('❌ Verification Failed:', error.message || error);
        if (axios.isAxiosError(error))
            console.error(error.response?.data);
    }
    finally {
        // Cleanup
        if (businessId) {
            console.log('Cleaning up...');
            await supabaseAdmin.from('businesses').delete().eq('id', businessId);
        }
    }
}
verifyPublicMenu();
