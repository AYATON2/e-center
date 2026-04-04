"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Users, CheckCircle } from 'lucide-react';

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
  
  const [successMsg, setSuccessMsg] = useState(false);
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('*');
    if (data) setPatients(data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data: ptData, error: ptError } = await supabase.from('patients').insert([formData]).select();
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
      
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      
      setFormData({ philhealth_no: '', full_name: '', dob: '', sex: 'Male', purok_address: '', contact_number: '', priority_group: 'General' });
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Intake</h1>
          <p className="page-description">Add new patients to the clinic record and assign to queue</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'minmax(240px, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div>
            <div className="stat-value">{patients.length}</div>
            <div className="stat-label">Total Registered Patients</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> New Patient Registration
        </h3>
        
        {successMsg && (
          <div className="animate-fade-in" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> Patient properly registered and sent to internal Supabase queue!
          </div>
        )}

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
