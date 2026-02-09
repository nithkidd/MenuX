import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value)
        env[key.trim()] = value.trim();
});
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
const API_URL = `http://localhost:${env.PORT || 3000}/api/v1`;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
async function verifyAuthAndBusiness() {
    try {
        console.log('1. Signing Up...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        if (signUpError)
            throw signUpError;
        console.log('   Signed up:', TEST_EMAIL);
        console.log('2. Signing In...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        if (signInError)
            throw signInError;
        const token = signInData.session?.access_token;
        console.log('   Signed in. Token received.');
        console.log('3. Creating Business...');
        const businessData = {
            name: `Test Biz ${Date.now()}`,
            business_type: 'restaurant',
            description: 'Test Description'
        };
        const res = await axios.post(`${API_URL}/business`, businessData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Business Created:', res.data.data.slug);
        console.log('✅ Auth & Business Flow Verified');
    }
    catch (error) {
        console.error('❌ Failed:', error.message || error);
        if (axios.isAxiosError(error)) {
            console.error('   API Response:', error.response?.data);
        }
    }
}
verifyAuthAndBusiness();
