const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seed() {
  const usersToCreate = [
    { email: 'admin@bhcms.com', password: 'Password123!', fullName: 'System Admin', role: 'Admin' },
    { email: 'nurse@bhcms.com', password: 'Password123!', fullName: 'Head Nurse', role: 'Nurse' },
    { email: 'staff@bhcms.com', password: 'Password123!', fullName: 'Frontdesk Staff', role: 'Staff' }
  ];

  for (const u of usersToCreate) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName, role: u.role }
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`User ${u.email} already exists.`);
        // Note: we can't easily fetch their password, but they probably used something simple.
      } else {
        console.error(`Error creating ${u.email}:`, error.message);
      }
    } else {
      console.log(`Created: ${u.email} / ${u.password} (${u.role})`);
    }
  }
}
seed();
