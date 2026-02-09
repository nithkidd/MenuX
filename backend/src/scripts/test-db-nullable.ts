
import { supabaseAdmin as supabase } from '../config/supabase.js';

async function testNullable() {
  console.log('Testing profiles.auth_user_id nullability...');
  
  // We can't query information_schema easily via Supabase JS client (unless RPC).
  // But we can try to insert a row with NULL auth_user_id and see if it fails.
  
  // Actually, we can't easily query information_schema without SQL editor access or postgres connection.
  // The JS client is just an API client.
  
  // Let's try to insert a DUMMY profile with null auth_user_id directly.
  // We need a valid user_id (if we enforce FK).
  // But we can check error message.
  
  const dummyUserId = '00000000-0000-0000-0000-000000000000'; // Invalid user_id will fail FK.
  // We need a valid user first.
  
  // Create temp user
  const username = `test_null_${Date.now()}`;
  const { data: user, error } = await supabase.from('users').insert({
      username,
      email: `${username}@test.com`,
      password_hash: 'hash',
  }).select().single();
  
  if (error) {
      console.error('Failed to create temp user:', error.message);
      return;
  }
  
  console.log('Created temp user:', user.id);
  
  // Try insert profile with NULL auth_user_id
  const { error: profileError } = await supabase.from('profiles').insert({
      user_id: user.id,
      email: 'test@test.com',
      auth_user_id: null 
      // If NOT NULL constraint exists, this will fail.
  });
  
  if (profileError) {
      console.error('❌ Insert with NULL auth_user_id FAILED:', profileError.message);
      if (profileError.message.includes('null value in column "auth_user_id"')) {
          console.error('🚨 CONFIRMED: auth_user_id is still NOT NULL. SQL failed.');
      }
  } else {
      console.log('✅ Insert with NULL auth_user_id SUCCEEDED. Constraint is gone.');
  }
}

testNullable();
