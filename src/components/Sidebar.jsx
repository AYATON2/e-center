"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserPlus, Stethoscope, Package, FileText, ArrowLeft } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isStaff = pathname.startsWith('/staff');
  const isNurse = pathname.startsWith('/nurse');

  return (
    <aside className="sidebar">
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏥</span> BHCMS
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Barangay Health Center</p>
      </div>

      <nav className="sidebar-nav" style={{ flexGrow: 1 }}>
        {isStaff && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', letterSpacing: '0.05em' }}>
              Staff Actions
            </div>
            <Link href="/staff" className={`nav-item ${pathname === '/staff' ? 'active' : ''}`}>
              <UserPlus size={18} /> Add Patient
            </Link>
            <Link href="/staff/inventory" className={`nav-item ${pathname === '/staff/inventory' ? 'active' : ''}`}>
              <Package size={18} /> Inventory Only
            </Link>
          </>
        )}

        {isNurse && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', letterSpacing: '0.05em' }}>
              Nurse Dashboard
            </div>
            <Link href="/nurse" className={`nav-item ${pathname === '/nurse' ? 'active' : ''}`}>
              <Stethoscope size={18} /> Consultations
            </Link>
            <Link href="/nurse/records" className={`nav-item ${pathname === '/nurse/records' ? 'active' : ''}`}>
              <FileText size={18} /> EHR & Reports
            </Link>
            <Link href="/nurse/inventory" className={`nav-item ${pathname === '/nurse/inventory' ? 'active' : ''}`}>
              <Package size={18} /> Inventory Access
            </Link>
          </>
        )}
      </nav>
      
      <div className="sidebar-nav">
         <Link href="/" className="nav-item">
          <ArrowLeft size={18} /> Exit Dashboard
        </Link>
      </div>
    </aside>
  );
}
