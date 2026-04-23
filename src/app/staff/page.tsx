"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Users, CheckCircle, Search, ArrowRight } from 'lucide-react';

export default function StaffDashboard() {
  const [formData, setFormData] = useState({
    philhealth_no: '',
    full_name: '',
    dob: '',
    sex: 'Male',
    purok_address: '',
    contact_number: '',
    priority_group: 'General'
  });
  
  const [successMsg, setSuccessMsg] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    // Only fetch non-archived patients for clinical intake
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (data) setPatients(data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data: ptData, error: ptError } = await supabase.from('patients').insert([{
        ...formData,
        is_archived: false
      }]).select();
      if (ptError) throw ptError;
      
      const patientId = ptData[0].id;
      
      const { error: encError } = await supabase.from('encounters').insert([{
        patient_id: patientId,
        encounter_date: new Date().toISOString().split('T')[0],
        time_in: new Date().toLocaleTimeString(),
        status: 'Queued',
        priority_group: formData.priority_group
      }]);
      if (encError) throw encError;
      
      setSuccessMsg('New Patient properly registered and sent to queue!');
      setTimeout(() => setSuccessMsg(''), 4000);
      
      setFormData({ philhealth_no: '', full_name: '', dob: '', sex: 'Male', purok_address: '', contact_number: '', priority_group: 'General' });
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturningCheckIn = async (patient) => {
    try {
      const { error: encError } = await supabase.from('encounters').insert([{
        patient_id: patient.id,
        encounter_date: new Date().toISOString().split('T')[0],
        time_in: new Date().toLocaleTimeString(),
        status: 'Queued',
        priority_group: patient.priority_group
      }]);
      
      if (encError) throw encError;
      
      setSearchTerm('');
      setSuccessMsg(`Returning patient ${patient.full_name} has been added to the active queue!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = searchTerm.trim() === '' ? [] : patients.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Intake & Registration</h1>
          <p className="page-description">Check-in returning patients or profile entirely new patients to the clinical queue</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'minmax(240px, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div>
            <div className="stat-value">{patients.length}</div>
            <div className="stat-label">Total Registered Profiles</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="animate-fade-in" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Returning Patient Check-In */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} /> Returning Patient Check-In
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Search for an existing patient to instantly queue them for consultation without re-registering.</p>
        
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Search existing profile by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPatients.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {filteredPatients.map(p => (
              <div key={p.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span>DOB: {p.dob}</span>
                    <span>| Priority: {p.priority_group}</span>
                  </div>
                </div>
                <button onClick={() => handleReturningCheckIn(p)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                  Check-In <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> New Patient Registration
        </h3>
        
        <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Dela Cruz, Juan" />
          </div>
          <div>
            <label className="label">PhilHealth No. (Optional)</label>
            <input type="text" className="input" value={formData.philhealth_no} onChange={e => setFormData({...formData, philhealth_no: e.target.value})} placeholder="00-000000000-0" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className="label">Sex</label>
              <select className="input" value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Priority Group</label>
            <select className="input" value={formData.priority_group} onChange={e => setFormData({...formData, priority_group: e.target.value})}>
              <option value="General">General / None</option>
              <option value="Infant">Infant / Early Born</option>
              <option value="Pregnant">Pregnant</option>
              <option value="Senior">Senior Citizen / NCD</option>
            </select>
          </div>

          <div>
            <label className="label">Purok / Address</label>
            <input type="text" className="input" required value={formData.purok_address} onChange={e => setFormData({...formData, purok_address: e.target.value})} placeholder="Purok 1" />
          </div>
          <div>
            <label className="label">Contact Number</label>
            <input type="text" className="input" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} placeholder="09XX-XXX-XXXX" />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save & Transfer to Queue</button>
          </div>
        </form>
      </div>
    </div>
  );
}
