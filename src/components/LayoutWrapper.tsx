"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      enforceRules(currentSession);
      setLoading(false);
    });

    // Listen continuously for logout / login overrides
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      enforceRules(newSession);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  const enforceRules = (currentSession) => {
    if (pathname === '/' || pathname === '/login') return; 
    
    if (!currentSession) {
      router.push('/login');
      return;
    }

    const role = currentSession.user?.user_metadata?.role || 'Staff'; // Default mapping safety
    
    // Hard restrictions blocking lateral role movement
    if (pathname.startsWith('/admin') && role !== 'Admin') {
      router.push('/login');
    } else if (pathname.startsWith('/nurse') && role !== 'Nurse' && role !== 'Admin') {
      router.push('/login');
    } else if (pathname.startsWith('/staff') && role !== 'Staff' && role !== 'Admin') {
      router.push('/login');
    }
  };

  if (loading || !mounted) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: 'var(--bg-primary)', color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 600}}>
      Verifying Security Block...
    </div>
  );

  // Safely handle null pathname during static generation
  const currentPath = pathname || '';

  if (currentPath === '/' || currentPath === '/login' || currentPath === '/_not-found' || currentPath === '/404') {
    return <main>{children}</main>;
  }
  
  return (
    <div className="dashboard-layout">
      <Sidebar role={session?.user?.user_metadata?.role || 'Staff'} email={session?.user?.email} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
