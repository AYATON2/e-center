"use client";

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Stethoscope, Activity, FileCheck, ArrowRight, User } from 'lucide-react';

export default function NurseDashboard() {
  const [activeEncounterId, setActiveEncounterId] = useState(null);
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', weight: '' });
  const [notes, setNotes] = useState('');
  const [nextAppt, setNextAppt] = useState('');
  const [dispensedItems, setDispensedItems] = useState([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [dispenseQty, setDispenseQty] = useState(1);

  const activeEncounters = useLiveQuery(() => db.encounters.where('status').equals('Queued').toArray()) || [];
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const inventory = useLiveQuery(() => db.inventory.toArray()) || [];

  const handleStartConsultation = (encounterId) => {
    setActiveEncounterId(encounterId);
    // Reset forms
    setVitals({ bp: '', hr: '', temp: '', weight: '' });
    setNotes('');
    setNextAppt('');
    setDispensedItems([]);
  };

  const handleCompleteConsultation = async () => {
    if (!activeEncounterId) return;
    
    try {
      await db.encounters.update(activeEncounterId, {
        status: 'Completed',
        vitals: vitals,
        diagnosis: notes,
        next_appointment: nextAppt,
        sms_reminder_sent: false,
        dispensed_items: dispensedItems
      });

      // Deduct from inventory
      for (const item of dispensedItems) {
        const invStr = String(item.inventory_id);
        const invItem = await db.inventory.get(Number(invStr));
        if (invItem && invItem.quantity_on_hand >= item.quantity) {
          await db.inventory.update(Number(invStr), {
            quantity_on_hand: invItem.quantity_on_hand - item.quantity
          });
        }
      }

      setActiveEncounterId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const activeEncounter = activeEncounters.find(e => e.id === activeEncounterId);
  const activePatient = activeEncounter ? patients.find(p => p.id === activeEncounter.patient_id) : null;

  const renderSpecializedForm = (group) => {
    switch(group) {
      case 'Infant':
        return (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#dbeafe', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
            <h4 style={{ color: '#1e40af', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Infant EPI & Growth Tracker</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="label">BCG Given</label><input type="checkbox" /></div>
              <div><label className="label">Hepa B Given</label><input type="checkbox" /></div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label">Growth Z-Score / Status</label>
                <select className="input"><option>Normal</option><option>Stunted</option><option>Wasting</option></select>
              </div>
            </div>
          </div>
        );
      case 'Pregnant':
        return (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fce7f3', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
            <h4 style={{ color: '#9d174d', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Maternal Care Tracker</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="label">Fundal Height (cm)</label><input type="number" className="input" /></div>
              <div><label className="label">Fetal Heart Tone</label><input type="text" className="input" /></div>
              <div><label className="label">Tetanus Toxoid Status</label><select className="input"><option>TT1</option><option>TT2</option><option>TT3+</option></select></div>
            </div>
          </div>
        );
      case 'Senior':
        return (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
            <h4 style={{ color: '#92400e', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>NCD Maintenance Tracker</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="label">Blood Sugar (mg/dL)</label><input type="number" className="input" /></div>
              <div><label className="label">Maintenance Meds Dispensed</label>
                 <select className="input">
                   <option>None</option>
                   {inventory.filter(i => i.category === 'Medication').map(med => (
                     <option key={med.id}>{med.item_name} (Stock: {med.quantity_on_hand})</option>
                   ))}
                 </select>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', height: '100%' }}>
      
      {/* Left Sidebar: Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Next Patient</h1>
            <p className="page-description">Clinical Room Queue</p>
          </div>
        </div>
        
        <div className="card" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {activeEncounters.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>No patients waiting.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeEncounters.map((encounter) => {
                const pat = patients.find(p => p.id === encounter.patient_id);
                return (
                  <div key={encounter.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '1rem', 
                      cursor: 'pointer',
                      border: activeEncounterId === encounter.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      transition: 'var(--transition)'
                    }}
                    onClick={() => handleStartConsultation(encounter.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{pat?.full_name || 'Loading...'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{encounter.time_in}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Priority: {pat?.priority_group}</span>
                      <ArrowRight size={16} style={{ color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Active Encounter */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Active Consultation</h1>
        </div>

        {!activeEncounter ? (
           <div className="card" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
             <Stethoscope size={48} style={{ opacity: 0.2 }} />
             <p>Select a patient from the queue to start their consultation.</p>
           </div>
        ) : (
           <div className="card animate-fade-in" style={{ flexGrow: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <User size={24} style={{ color: 'var(--primary-color)' }} />
               </div>
               <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activePatient?.full_name}</h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                    <span>Sex: {activePatient?.sex}</span>
                    <span>DOB: {activePatient?.dob}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Group: {activePatient?.priority_group}</span>
                  </div>
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Activity size={18} /> Vitals Intake</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div><label className="label">Blood Pressure</label><input type="text" className="input" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} /></div>
                    <div><label className="label">Heart Rate</label><input type="number" className="input" placeholder="bpm" value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} /></div>
                    <div><label className="label">Temp (°C)</label><input type="number" step="0.1" className="input" placeholder="36.5" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} /></div>
                    <div><label className="label">Weight (kg)</label><input type="number" step="0.1" className="input" placeholder="kg" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} /></div>
                  </div>

                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><FileCheck size={18} /> Clinical Notes</h3>
                  <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Chief complaint, diagnosis, treatment plan..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                  
                  {activePatient && renderSpecializedForm(activePatient.priority_group)}

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
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</h3>
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)' }}>
                    <label className="label" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>📅 Schedule Next Visit</label>
                    <input type="date" className="input" value={nextAppt} onChange={e => setNextAppt(e.target.value)} />
                  </div>
                  <button className="btn btn-primary w-full" onClick={handleCompleteConsultation}>
                    Complete Consultation
                  </button>
                  <button className="btn btn-secondary w-full" style={{ color: 'var(--danger-color)' }}>
                    Refer to Hospital
                  </button>
                  
                  <div style={{ marginTop: 'auto', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Patient History summary will be verified against DexieDB.</p>
                  </div>
                </div>
             </div>
           </div>
        )}
      </div>

    </div>
  );
}
