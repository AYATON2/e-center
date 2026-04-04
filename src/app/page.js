import Link from 'next/link';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '3rem' }}>🏥</span> BHCMS
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Barangay Health Center Management System</p>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/staff" className="card" style={{ textDecoration: 'none', width: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2.5rem' }}>👨‍💼</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Staff Access</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem', marginTop: '0.5rem' }}>Add Patients & Manage Inventory</p>
          </Link>

          <Link href="/nurse" className="card" style={{ textDecoration: 'none', width: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2.5rem' }}>🩺</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nurse Access</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem', marginTop: '0.5rem' }}>Active Consultations & EHR Records</p>
          </Link>
        </div>
    </div>
  );
}
