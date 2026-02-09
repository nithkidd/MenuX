
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

async function promoteUser() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.log('Usage: npx ts-node src/scripts/promote-user.ts <email> <role>');
    console.log('Roles: user, admin, super_admin');
    process.exit(1);
  }

  if (!['user', 'admin', 'super_admin'].includes(role)) {
    console.error('Invalid role. Must be one of: user, admin, super_admin');
    process.exit(1);
  }

  console.log(`Promoting ${email} to ${role}...`);

  // 1. Get user by email to find ID (auth.users) - actually we need profile
  // flexible search: check profiles directly
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error(`User with email ${email} not found in profiles.`);
    // Try to find in auth.users?
    // Admin client can list users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.email === email);
    
    if (authUser) {
      console.log(`Found in auth.users (ID: ${authUser.id}), but not in profiles.`);
      console.log('Creating profile...');
      const { error: createError } = await supabase.from('profiles').insert({
        auth_user_id: authUser.id,
        email: email,
        role: role
      });
      if (createError) {
        console.error('Failed to create profile:', createError);
      } else {
        console.log('✅ Profile created and role assigned!');
      }
      return;
    } else {
      console.error('User not found in auth system either.');
      process.exit(1);
    }
  }

  // 2. Update role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update role:', updateError);
    process.exit(1);
  }

  console.log(`✅ Successfully promoted ${email} to ${role}`);
}

promoteUser();
