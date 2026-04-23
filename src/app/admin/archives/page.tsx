"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Package, Search, Filter, Calendar, User, FileText, Trash2 } from 'lucide-react';

export default function AdminArchives() {
  const [encounters, setEncounters] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [encRes, ptRes] = await Promise.all([
      supabase.from('encounters').select('*').eq('status', 'Completed').order('created_at', { ascending: false }),
      supabase.from('patients').select('*')
    ]);
    if (encRes.data) setEncounters(encRes.data);
    if (ptRes.data) setPatients(ptRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPatientName = (id) => {
    const pt = patients.find(p => String(p.id) === String(id));
    return pt ? pt.full_name : 'Unknown Patient';
  };

  const handleDeleteRecord = async (id) => {
    const confirmDelete = confirm("Are you sure you want to permanently delete this clinical record? This action cannot be undone.");
    if (!confirmDelete) return;

    const { error } = await supabase.from('encounters').delete().eq('id', id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchData();
    }
  };

  const filteredEncounters = encounters.filter(enc => 
    getPatientName(enc.patient_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enc.diagnosis && enc.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} style={{ color: 'var(--primary-color)' }}/> Archived Clinical Records
          </h1>
          <p className="page-description">Historical log of all completed patient consultations and treatments</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="Search by patient name or diagnosis..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchData}><Filter size={18} /> Refresh</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading archives...</div>
        ) : filteredEncounters.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No archived records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Patient Name</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Diagnosis / Notes</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Dispensed Items</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Visit Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEncounters.map(enc => (
                  <tr key={enc.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                        {new Date(enc.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} style={{ opacity: 0.6 }} />
                        {getPatientName(enc.patient_id)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {enc.diagnosis || 'No notes recorded'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {enc.dispensed_items && enc.dispensed_items.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {enc.dispensed_items.map((item, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                              {item.quantity}x {item.item_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                       {enc.is_cleared ? (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                           <span style={{ color: '#16a34a', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, alignSelf: 'flex-start' }}>Cleared</span>
                           <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Treatment Done</span>
                         </div>
                       ) : enc.next_appointment ? (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                           <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, alignSelf: 'flex-start' }}>Follow-up</span>
                           <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{enc.next_appointment}</span>
                         </div>
                       ) : (
                         <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Completed</span>
                       )}
                     </td>
                     <td style={{ padding: '1rem 0.5rem' }}>
                        <button 
                          onClick={() => handleDeleteRecord(enc.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px' }}
                          title="Delete Record"
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={16} />
                        </button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
