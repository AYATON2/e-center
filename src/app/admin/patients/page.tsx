"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users, Search, Archive, RotateCcw, AlertTriangle, FileText, Calendar, Activity, X, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminPatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Patient History State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('patients').select('*').order('full_name', { ascending: true });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setPatients(data || []);
      setErrorMsg('');
    }
    setLoading(false);
  };

  const fetchPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('encounters')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });
    
    if (data) setPatientHistory(data);
    setHistoryLoading(false);
  };

  const handleDeleteEncounter = async (id) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this clinical encounter record?")) return;
    
    const { error } = await supabase.from('encounters').delete().eq('id', id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      // Refresh current history
      if (selectedPatient) {
        const { data } = await supabase
          .from('encounters')
          .select('*')
          .eq('patient_id', selectedPatient.id)
          .order('created_at', { ascending: false });
        if (data) setPatientHistory(data);
      }
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleArchive = async (e, id, currentStatus) => {
    e.stopPropagation(); // Prevent opening history modal
    const newStatus = !currentStatus;
    const { error } = await supabase.from('patients').update({ is_archived: newStatus }).eq('id', id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchPatients();
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.philhealth_no && p.philhealth_no.includes(searchTerm))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} style={{ color: 'var(--primary-color)' }}/> Patient Records Management
          </h1>
          <p className="page-description">Maintain patient database integrity and archive inactive or departed records</p>
        </div>
      </div>

      {errorMsg && (
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle size={20} />
          <div>
             <div style={{ fontWeight: 700 }}>Database Error</div>
             <div style={{ fontSize: '0.875rem' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Search patients by name or PhilHealth number..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading patient records...</div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No patients found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Full Name</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Group</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Address</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr 
                    key={p.id} 
                    onClick={() => fetchPatientHistory(p)}
                    style={{ borderBottom: '1px solid var(--border-color)', opacity: p.is_archived ? 0.6 : 1, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{p.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PhilHealth: {p.philhealth_no || 'None'}</div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                       <span className={`badge badge-${p.priority_group?.toLowerCase() || 'general'}`}>{p.priority_group}</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{p.purok_address}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                       {p.is_archived ? (
                         <span style={{ color: '#dc2626', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Archived</span>
                       ) : (
                         <span style={{ color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                       )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                       <button 
                         onClick={(e) => handleArchive(e, p.id, p.is_archived)} 
                         className="btn" 
                         style={{ 
                           padding: '0.4rem 0.8rem', 
                           fontSize: '0.8rem', 
                           background: p.is_archived ? 'var(--primary-color)' : '#f1f5f9',
                           color: p.is_archived ? 'white' : 'var(--text-primary)',
                           border: '1px solid var(--border-color)'
                         }}>
                         {p.is_archived ? (
                           <><RotateCcw size={14} /> Restore</>
                         ) : (
                           <><Archive size={14} /> Archive</>
                         )}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PATIENT HISTORY MODAL */}
      {selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedPatient.full_name}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                   <span>{selectedPatient.sex}</span>
                   <span>•</span>
                   <span>{selectedPatient.priority_group}</span>
                   <span>•</span>
                   <span>{selectedPatient.purok_address}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Activity size={18} style={{ color: 'var(--primary-color)' }} /> Clinical History
              </h3>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading history...</div>
              ) : patientHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                   No clinical encounters recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {patientHistory.map(enc => (
                    <div key={enc.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                          <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                          {new Date(enc.created_at).toLocaleDateString()}
                          {enc.is_cleared && <span style={{ marginLeft: '0.5rem', color: '#16a34a', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>Cleared</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consultation Record</div>
                          <button 
                            onClick={() => handleDeleteEncounter(enc.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Diagnosis / Notes</div>
                          <div style={{ fontSize: '0.9rem' }}>{enc.diagnosis || 'No specific notes recorded.'}</div>

                          {enc.dispensed_items && enc.dispensed_items.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Dispensed Medication</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {enc.dispensed_items.map((item, idx) => (
                                  <span key={idx} style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                    {item.quantity}x {item.item_name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', height: 'fit-content' }}>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Vitals</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', fontSize: '0.875rem' }}>
                            <div><span style={{ opacity: 0.6 }}>BP:</span> {enc.vitals?.bp || 'N/A'}</div>
                            <div><span style={{ opacity: 0.6 }}>HR:</span> {enc.vitals?.hr || 'N/A'}</div>
                            <div><span style={{ opacity: 0.6 }}>Temp:</span> {enc.vitals?.temp || 'N/A'}°C</div>
                            <div><span style={{ opacity: 0.6 }}>Weight:</span> {enc.vitals?.weight || 'N/A'}kg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>Close History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
