"use client";
import { useState, useEffect } from 'react';
import { Shield, UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLoad, setErrorLoad] = useState('');
  
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', role: 'Staff' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/list-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
      setErrorLoad('');
    } catch(e) {
      setErrorLoad(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStatusMsg({ type: 'success', text: `Successfully generated a configured ${formData.role} account for ${formData.fullName}!` });
      setFormData({ email: '', password: '', fullName: '', role: 'Staff' });
      fetchUsers();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} style={{ color: 'var(--primary-color)' }}/> System Administration
          </h1>
          <p className="page-description">Manage access control and generate BHCMS active employee portal accounts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Create User Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18} /> Generate Employee Account</h3>
          
          {statusMsg.text && (
            <div className="animate-fade-in" style={{ padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: statusMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: statusMsg.type === 'success' ? '#166534' : '#991b1b', lineHeight: 1.4 }}>
              <div style={{marginTop: '2px'}}>{statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
              <div>{statusMsg.text}</div>
            </div>
          )}

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Full Name</label>
              <input type="text" required className="input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label">Email Address (Login ID)</label>
              <input type="email" required className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@bhcms.local" />
            </div>
            <div>
              <label className="label">Temporary Password</label>
              <input type="text" required minLength={6} className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" />
            </div>
            <div>
              <label className="label">System Role / Dashboard Access</label>
              <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Staff">Front Desk Staff (Queue & Inventory)</option>
                <option value="Nurse">Nurse (Clinical & EHR)</option>
                <option value="Admin">System Admin (Full Access)</option>
              </select>
            </div>
            <button type="submit" disabled={creating} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {creating ? 'Generating Securely...' : 'Create Authorized User'}
            </button>
          </form>
        </div>

        {/* List Users */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Active Personnel Directory</h3>
          
          {errorLoad ? (
             <div className="animate-fade-in" style={{ padding: '1.5rem', background: '#fffbeb', color: '#b45309', borderRadius: '4px', border: '1px solid #fde68a' }}>
               <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Shield size={16} /> Service Key Required</h4>
               <p style={{ fontSize: '0.875rem' }}>To view and provision system users, you must append your <b>SUPABASE_SERVICE_ROLE_KEY</b> to your <code>.env.local</code> file and restart the development server. You can find this in your Supabase Dashboard under <b>Project Settings → API</b>.</p>
               <br/>
               <p style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'monospace' }}>Engine Return: {errorLoad}</p>
             </div>
          ) : loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading directory...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ paddingBottom: '0.75rem' }}>Name</th>
                  <th style={{ paddingBottom: '0.75rem' }}>Email / Login ID</th>
                  <th style={{ paddingBottom: '0.75rem' }}>Security Role</th>
                  <th style={{ paddingBottom: '0.75rem' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{u.user_metadata?.full_name || 'Unknown'}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ fontSize: '0.75rem', background: u.user_metadata?.role === 'Admin' ? '#fef3c7' : 'var(--bg-secondary)', color: u.user_metadata?.role === 'Admin' ? '#b45309' : 'inherit', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {u.user_metadata?.role || 'Staff'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No personnel registered currently. Add one to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
