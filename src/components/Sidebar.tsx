"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { UserPlus, Users, Stethoscope, Package, FileText, LogOut, Shield, Calendar, Settings } from 'lucide-react';

export default function Sidebar({ role, email }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isStaff = role === 'Staff' || role === 'Admin';
  const isNurse = role === 'Nurse' || role === 'Admin';
  const isAdmin = role === 'Admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏥</span> BHCMS
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{email}</p>
        <div style={{ marginTop: '0.5rem', background: 'var(--bg-secondary)', display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{role} Access</div>
      </div>

      <nav className="sidebar-nav" style={{ flexGrow: 1, marginTop: '2rem' }}>
        
        {isAdmin && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              System Admin
            </div>
            <Link href="/admin" className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
              <Shield size={18} /> User Management
            </Link>
            <Link href="/admin/patients" className={`nav-item ${pathname === '/admin/patients' ? 'active' : ''}`}>
              <Users size={18} /> Patient Management
            </Link>
            <Link href="/admin/archives" className={`nav-item ${pathname === '/admin/archives' ? 'active' : ''}`}>
              <Package size={18} /> Archived Data
            </Link>
            <Link href="/admin/reports" className={`nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}>
              <FileText size={18} /> Health Reports
            </Link>
            <Link href="/admin/settings" className={`nav-item ${pathname === '/admin/settings' ? 'active' : ''}`}>
              <Settings size={18} /> System Settings
            </Link>
          </>
        )}

        {isStaff && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', letterSpacing: '0.05em' }}>
              Staff Tools
            </div>
            <Link href="/staff" className={`nav-item ${pathname === '/staff' ? 'active' : ''}`}>
              <UserPlus size={18} /> Registration Intake
            </Link>
            <Link href="/staff/inventory" className={`nav-item ${pathname === '/staff/inventory' ? 'active' : ''}`}>
              <Package size={18} /> Central Inventory
            </Link>
            <Link href="/staff/schedule" className={`nav-item ${pathname === '/staff/schedule' ? 'active' : ''}`}>
              <Calendar size={18} /> Public Schedule
            </Link>
          </>
        )}

        {isNurse && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', letterSpacing: '0.05em' }}>
              Clinical Room
            </div>
            <Link href="/nurse" className={`nav-item ${pathname === '/nurse' ? 'active' : ''}`}>
              <Stethoscope size={18} /> Queue & Consultations
            </Link>
            <Link href="/nurse/records" className={`nav-item ${pathname === '/nurse/records' ? 'active' : ''}`}>
              <FileText size={18} /> EHR & Discharges
            </Link>
            <Link href="/nurse/inventory" className={`nav-item ${pathname === '/nurse/inventory' ? 'active' : ''}`}>
              <Package size={18} /> Inventory Status
            </Link>
          </>
        )}
      </nav>
      
      <div className="sidebar-nav">
         <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, color: 'var(--danger-color)' }}>
          <LogOut size={18} /> Secure Logout
        </button>
      </div>
    </aside>
  );
}
