import { createClient } from '@supabase/supabase-js';

// These are allowed to be placeholder strings during build time to prevent crashes
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : 'https://placeholder.supabase.co';
  
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined')
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : 'placeholder';

// Detect browser execution for Next.js SSR safety
const isBrowser = typeof window !== 'undefined';

// We wrap initialization in a try-catch to ensure the build never fails due to Supabase
let supabaseClient;

try {
  // Only attempt real initialization if we have a valid-looking URL
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: isBrowser ? window.sessionStorage : undefined,
        autoRefreshToken: isBrowser,
        persistSession: isBrowser,
        detectSessionInUrl: isBrowser
      }
    });
  } else {
    throw new Error('Invalid Supabase URL');
  }
} catch (e) {
  console.warn('Supabase initialization bypassed for build stability. Error:', e.message);
  
  // Dummy client to prevent crashes during build-time module analysis
  // It provides just enough structure to avoid "undefined" property access errors
  supabaseClient = {
    from: () => ({
      select: () => ({
        order: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            then: (cb) => cb({ data: [], error: null })
          }),
          then: (cb) => cb({ data: [], error: null })
        }),
        then: (cb) => cb({ data: [], error: null })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: new Error('Auth disabled during build') }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}

export const supabase = supabaseClient;
