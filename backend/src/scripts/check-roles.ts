
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRoles() {
  console.log('Checking roles configuration...');

  // 1. Check if column exists by trying to select it
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, full_name')
    .limit(10);

  if (error) {
    console.error('❌ Error assessing profiles table:', error.message);
    if (error.message.includes('column "role" does not exist')) {
      console.error('CRITICAL: The "role" column is missing. Migration failed or was not applied.');
    }
    return;
  }

  console.log('✅ Profiles table has role access.');
  console.log('\nCurrent Users and Roles:');
  console.table(data.map(p => ({ 
    email: p.email, 
    role: p.role || '(null) -> defaults to user', 
    name: p.full_name 
  })));

  // Check unique roles
  const roles = [...new Set(data.map(p => p.role))];
  console.log('\nDistinct roles found:', roles);
}

checkRoles();
