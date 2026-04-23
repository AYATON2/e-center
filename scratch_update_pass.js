const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetPasswords() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  const emailsToReset = ['admin@bhcms.com', 'nurse@bhcms.com', 'staff@bhcms.com'];
  
  for (const user of users) {
    if (emailsToReset.includes(user.email)) {
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: 'Password123!', email_confirm: true }
      );
      if (updateError) {
        console.error(`Failed to update ${user.email}:`, updateError.message);
      } else {
        console.log(`Successfully reset password for ${user.email}`);
      }
    }
  }
}

resetPasswords();
