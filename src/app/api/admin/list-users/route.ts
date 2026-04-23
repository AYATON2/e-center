import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  
  if (!serviceKey) return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment configuration.' }, { status: 500 });
  
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json({ users: data.users });
}
