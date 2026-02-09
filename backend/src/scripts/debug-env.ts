
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully');
}

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('SUPABASE_SERVICE_ROLE_KEY length:', key ? key.length : 0);
console.log('SUPABASE_SERVICE_ROLE_KEY start:', key ? key.substring(0, 10) : 'N/A');
console.log('SUPABASE_SERVICE_ROLE_KEY end:', key ? key.substring(key.length - 10) : 'N/A');
