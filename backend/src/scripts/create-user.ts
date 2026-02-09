
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env explicitly from backend root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars!');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseServiceKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'password123';

  console.log(`Creating user: ${email}...`);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Test Business User' }
    });

    if (error) {
        if (error.message.includes('already been registered')) {
            console.log('User already exists! You can log in with:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.error('Error creating user:', error.message);
        }
    } else {
        console.log('User created successfully:', data.user.id);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
  } catch (err) {
      console.error('Unexpected error:', err);
  }
}

createTestUser();
