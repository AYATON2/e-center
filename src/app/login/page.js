"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user?.user_metadata?.role;
        if (role === 'Admin') router.push('/admin');
        else if (role === 'Nurse') router.push('/nurse');
        else router.push('/staff');
      }
    });
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    
    const role = data.user?.user_metadata?.role;
    if (role === 'Admin') router.push('/admin');
    else if (role === 'Nurse') router.push('/nurse');
    else router.push('/staff');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', backgroundImage: 'radial-gradient(#dbeafe 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      <div className="card" style={{ width: '420px', padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--shadow-xl)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🏥</span> BHCMS
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.875rem', textAlign: 'center' }}>Barangay Health Center Management System<br/><span style={{fontWeight:600}}>Secure Portal Login</span></p>
        
        {errorMsg && (
          <div style={{ width: '100%', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #fecaca' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="email" required className="input" placeholder="Registered Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="password" required className="input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
