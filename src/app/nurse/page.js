"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Stethoscope, CheckCircle, Activity, HeartPulse, User, MessageSquare } from 'lucide-react';
import SendSmsModal from '../../components/SendSmsModal';

export default function NurseDashboard() {
  const [activeEncounterId, setActiveEncounterId] = useState(null);
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', weight: '' });
  const [notes, setNotes] = useState('');
  const [nextAppt, setNextAppt] = useState('');
  const [dispensedItems, setDispensedItems] = useState([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [dispenseQty, setDispenseQty] = useState(1);

  const [activeEncounters, setActiveEncounters] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [smsModalPatient, setSmsModalPatient] = useState(null);

  const fetchData = async () => {
    const [encRes, ptRes, invRes] = await Promise.all([
      supabase.from('encounters').select('*').eq('status', 'Queued'),
      supabase.from('patients').select('*'),
      supabase.from('inventory').select('*')
    ]);
    if (encRes.data) setActiveEncounters(encRes.data);
    if (ptRes.data) setPatients(ptRes.data);
    if (invRes.data) setInventory(invRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartConsultation = (encounterId) => {
    setActiveEncounterId(encounterId);
    setVitals({ bp: '', hr: '', temp: '', weight: '' });
    setNotes('');
    setNextAppt('');
    setDispensedItems([]);
  };

  const handleCompleteConsultation = async () => {
    try {
      await supabase.from('encounters').update({
        status: 'Completed',
        vitals: vitals,
        diagnosis: notes,
        next_appointment: nextAppt || null,
        sms_reminder_sent: false,
        dispensed_items: dispensedItems
      }).eq('id', activeEncounterId);

      // Deduct from inventory
      for (const item of dispensedItems) {
        const invItem = inventory.find(i => String(i.id) === String(item.inventory_id));
        if (invItem && invItem.quantity_on_hand >= item.quantity) {
          await supabase.from('inventory').update({
            quantity_on_hand: invItem.quantity_on_hand - item.quantity
          }).eq('id', item.inventory_id);
        }
      }

      setActiveEncounterId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getPatientDetails = (id) => patients.find(p => String(p.id) === String(id));
  const activeEncounter = activeEncounters.find(e => String(e.id) === String(activeEncounterId));
  const activePatient = activeEncounter ? getPatientDetails(activeEncounter.patient_id) : null;

  const renderSpecializedForm = (group) => {
    if (group === 'Infant') {
      return (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e0f2fe', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>EPI / Infant Growth Tracking</h4>
          <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Vaccine Administered</label>
          <select className="input" style={{ marginBottom: '1rem' }}>
            <option>None / Routine Check</option>
            <option>BCG</option>
            <option>Pentavalent 1/2/3</option>
            <option>OPV 1/2/3</option>
            <option>Measles</option>
          </select>
        </div>
      );
    }
    if (group === 'Pregnant') {
      return (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fce7f3', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#be185d', marginBottom: '0.5rem' }}>Maternal Care Parameters</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
               <label style={{ fontSize: '0.75rem', display: 'block' }}>Fundal Height (cm)</label>
               <input type="text" className="input" placeholder="e.g. 24" />
             </div>
             <div>
               <label style={{ fontSize: '0.75rem', display: 'block' }}>Fetal Heart Tone</label>
               <input type="text" className="input" placeholder="e.g. 140" />
             </div>
          </div>
        </div>
      );
    }
    if (group === 'Senior') {
      return (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#b45309', marginBottom: '0.5rem' }}>Senior NCD Assessment</h4>
          <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Blood Sugar / RBS</label>
          <input type="text" className="input" placeholder="e.g. 110 mg/dL" style={{ marginBottom: '1rem' }} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 40px)', display: 'grid', gridTemplateColumns: activeEncounterId ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
      
      {/* QUEUE PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h1 className="page-title" style={{ marginBottom: '1rem' }}>Pending Queue</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {activeEncounters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No patients in the queue.
            </div>
          ) : (
            activeEncounters.map(encounter => {
              const pt = getPatientDetails(encounter.patient_id);
              if (!pt) return null;
              
              return (
                <div key={encounter.id} className="card" onClick={() => handleStartConsultation(encounter.id)} style={{ cursor: 'pointer', border: activeEncounterId === encounter.id ? '2px solid var(--primary-color)' : '1px solid transparent', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{pt.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{encounter.time_in}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{pt.priority_group}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Ready</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ACTIVE CONSULTATION PANEL */}
      {activeEncounterId && activePatient && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{activePatient.full_name}</h2>
              <button 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }} 
                onClick={() => setSmsModalPatient(activePatient)}>
                <MessageSquare size={16} /> SMS Patient
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Sex:</span> {activePatient.sex}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Group:</span> {activePatient.priority_group}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {activePatient.purok_address}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> {activePatient.contact_number || 'N/A'}</div>
            </div>
          </div>

          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Stethoscope size={18} /> Clinical Notes</h3>
                <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Chief complaint, diagnosis, treatment plan..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                
                {renderSpecializedForm(activePatient.priority_group)}

                <h3 style={{ marginBottom: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>💊 Dispense Meds / Vaccines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 80px auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <div>
                    <label className="label">Select Vaccine / Med</label>
                    <select className="input" value={selectedInvId} onChange={e => setSelectedInvId(e.target.value)}>
                      <option value="">-- Choose Item --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.item_name} (Stock: {item.quantity_on_hand})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Qty</label>
                    <input type="number" min="1" className="input" value={dispenseQty} onChange={e => setDispenseQty(parseInt(e.target.value) || 1)} />
                  </div>
                  <button className="btn btn-secondary" onClick={() => {
                    if(!selectedInvId) return;
                    const invItem = inventory.find(i => String(i.id) === String(selectedInvId));
                    if(invItem) {
                      setDispensedItems([...dispensedItems, { inventory_id: selectedInvId, item_name: invItem.item_name, quantity: dispenseQty }]);
                      setSelectedInvId('');
                      setDispenseQty(1);
                    }
                  }}>Add</button>
                </div>

                {dispensedItems.length > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Items to Dispense:</h4>
                    <ul style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                      {dispensedItems.map((di, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}><span style={{fontWeight:600}}>{di.quantity}x</span> {di.item_name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Activity size={18} /> Vitals</h3>
                <div>
                  <label className="label">Blood Pressure (mmHg)</label>
                  <input type="text" className="input" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" />
                </div>
                <div>
                  <label className="label">Heart Rate (bpm)</label>
                  <input type="text" className="input" value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} placeholder="80" />
                </div>
                <div>
                  <label className="label">Temperature (°C)</label>
                  <input type="text" className="input" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="36.5" />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="text" className="input" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} placeholder="65" />
                </div>
                
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginTop: '1rem' }}>📅 Check-out</h3>
                <div>
                  <label className="label">Schedule Next Visit</label>
                  <input type="date" className="input" value={nextAppt} onChange={e => setNextAppt(e.target.value)} />
                  {nextAppt && <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '0.5rem' }}>SMS Reminder will be active for this date.</p>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setActiveEncounterId(null)}>Close / Cancel</button>
            <button className="btn btn-primary" onClick={handleCompleteConsultation}>Complete & Discharge</button>
          </div>
        </div>
      )}

      {smsModalPatient && (
        <SendSmsModal patient={smsModalPatient} onClose={() => setSmsModalPatient(null)} />
      )}
    </div>
  );
}
