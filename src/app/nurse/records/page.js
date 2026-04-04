"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FileText, Search, Activity, Calendar } from 'lucide-react';

export default function RecordsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [encounters, setEncounters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: ptData } = await supabase.from('patients').select('*');
      const { data: encData } = await supabase.from('encounters').select('*').eq('status', 'Completed').order('created_at', { ascending: false });
      
      if (ptData) setPatients(ptData);
      if (encData) setEncounters(encData);
    };
    fetchData();
  }, []);

  const filteredEncounters = encounters.filter(enc => {
    const p = patients.find(p => String(p.id) === String(enc.patient_id));
    if (!p) return false;
    return p.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Records (EHR)</h1>
          <p className="page-description">Review past completed consultations and histories</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Search by patient name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {filteredEncounters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No completed encounters found in Supabase.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredEncounters.map(encounter => {
              const pat = patients.find(p => String(p.id) === String(encounter.patient_id));
              return (
                <div key={encounter.id} className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
                  <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{pat?.full_name}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {encounter.encounter_date}</span>
                      <span>Priority: <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{pat?.priority_group}</span></span>
                      <span>Sex: {pat?.sex} | DOB: {pat?.dob}</span>
                      <span style={{ color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        📍 {pat?.purok_address} | 📞 {pat?.contact_number || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Notes & Diagnosis</h4>
                    <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{encounter.diagnosis || 'No notes provided.'}</p>
                    
                    {encounter.dispensed_items && encounter.dispensed_items.length > 0 && (
                      <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>💊 Dispensed Items</h4>
                        <div style={{ fontSize: '0.875rem' }}>
                          {encounter.dispensed_items.map((di, idx) => (
                            <span key={idx} style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginRight: '0.5rem' }}>
                              {di.quantity}x {di.item_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} style={{ color: 'var(--warning-color)' }} /> Vitals Details</div>
                      <span>BP: {encounter.vitals?.bp || '-'}</span>
                      <span>HR: {encounter.vitals?.hr || '-'}</span>
                      <span>Temp: {encounter.vitals?.temp || '-'}°C</span>
                      <span>Weight: {encounter.vitals?.weight || '-'}kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
