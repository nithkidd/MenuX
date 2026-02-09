
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setRole() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.log('\nUsage: npx tsx src/scripts/set-role.ts <email> <role>');
    console.log('Roles: user, admin, super_admin');
    console.log('\nExample: npx tsx src/scripts/set-role.ts user@example.com admin\n');
    process.exit(1);
  }

  if (!['user', 'admin', 'super_admin'].includes(role)) {
    console.error('❌ Invalid role. Must be one of: user, admin, super_admin');
    process.exit(1);
  }

  console.log(`Setting role for ${email} to ${role}...`);

  // 1. Find profile by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error(`❌ User with email ${email} not found in profiles table.`);
    
    // Suggest checking auth.users if not found
    console.log('Checking auth.users...');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.email === email);
    
    if (authUser) {
      console.log(`Found in auth.users (ID: ${authUser.id}). Creating profile...`);
      const { error: createError } = await supabase.from('profiles').insert({
        auth_user_id: authUser.id,
        email: email,
        role: role
      });
      
      if (createError) {
        console.error('Failed to create profile:', createError.message);
      } else {
        console.log(`✅ Created profile and set role to ${role}!`);
      }
      return;
    }
    
    console.error('User not found in auth system either.');
    process.exit(1);
  }

  console.log(`Current role: ${profile.role || 'user'}`);

  if (profile.role === role) {
    console.log('✅ User already has this role.');
    return;
  }

  // 2. Update role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Failed to update role:', updateError.message);
    process.exit(1);
  }

  console.log(`✅ Successfully updated ${email} to ${role}`);
}

setRole();
