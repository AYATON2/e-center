"use client";

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { supabase } from '../../../lib/supabase';
import { Calendar, Save, CheckCircle, Clock } from 'lucide-react';

export default function ScheduleEditor() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_schedules')
        .select('*')
        .order('order_idx', { ascending: true });
      
      if (error) throw error;
      if (data) {
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleUpdate = async (id, updatedFields) => {
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .update(updatedFields)
        .eq('id', id);
        
      if (!error) {
        setSuccessMsg('Schedule updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        
        // Update local state to reflect changes instantly without full reload
        setSchedules(schedules.map(sch => sch.id === id ? { ...sch, ...updatedFields } : sch));
      } else {
        alert('Failed to update schedule: ' + error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (id, field, value) => {
    setSchedules(schedules.map(sch => sch.id === id ? { ...sch, [field]: value } : sch));
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Public Schedule Management</h1>
          <p className="page-description">Modify the weekly check-up schedule visible to the public.</p>
        </div>
      </div>

      {successMsg && (
        <div className="animate-fade-in" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading schedule data...</div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {schedules.map((sch) => (
            <div key={sch.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr min-content', gap: '1rem', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              
              <div style={{ fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                <Calendar size={18} /> {sch.day}
              </div>
              
              <div>
                <label className="label">Focus / Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={sch.title} 
                  onChange={(e) => handleChange(sch.id, 'title', e.target.value)}
                  placeholder="e.g. General Consultations"
                />
              </div>

              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> Operating Hours</label>
                <input 
                  type="text" 
                  className="input" 
                  value={sch.time} 
                  onChange={(e) => handleChange(sch.id, 'time', e.target.value)}
                  placeholder="e.g. 8:00 AM - 5:00 PM"
                />
              </div>

              <div style={{ paddingTop: '1.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleUpdate(sch.id, { title: sch.title, time: sch.time })}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                  <Save size={16} /> Save
                </button>
              </div>

            </div>
          ))}

          {schedules.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No schedules configured in the database.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
