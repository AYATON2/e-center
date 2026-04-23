"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Settings, Save, Bell, Shield, Database, Phone, MapPin, Building, Info, AlertTriangle } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Settings State
  const [config, setConfig] = useState({
    centerName: 'Barangay Health Center',
    centerLocation: 'Poblacion, Municipal Hall Compound',
    contactNumber: '+63 912 345 6789',
    smsReminders: true,
    smsTemplate: 'Hi {patient}, this is a reminder for your health checkup on {date}. See you!',
    lowStockThreshold: 10,
    allowManualRegistration: true,
  });

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('Saving changes...');
    
    // Simulate API delay - ideally this would save to a 'settings' table
    await new Promise(r => setTimeout(r, 800));
    
    setSaveStatus('Settings updated successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={24} style={{ color: 'var(--primary-color)' }}/> System Settings
          </h1>
          <p className="page-description">Configure regional parameters, clinical templates, and system-wide notifications</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {saveStatus && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #bbf7d0', textAlign: 'center', fontWeight: 600 }}>
          {saveStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ 
              width: '100%', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
              background: activeTab === 'general' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <Building size={18} /> General Info
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            style={{ 
              width: '100%', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
              background: activeTab === 'notifications' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'notifications' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <Bell size={18} /> Notifications & SMS
          </button>
          <button 
            onClick={() => setActiveTab('clinical')}
            style={{ 
              width: '100%', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
              background: activeTab === 'clinical' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'clinical' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <Shield size={18} /> Clinical Logic
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            style={{ 
              width: '100%', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
              background: activeTab === 'database' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'database' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            <Database size={18} /> Data Management
          </button>
        </div>

        {/* Content Area */}
        <div className="card" style={{ minHeight: '400px' }}>
          {activeTab === 'general' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={20} /> Center Information</h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label className="label">Health Center Name</label>
                  <input 
                    type="text" className="input" 
                    value={config.centerName} 
                    onChange={e => setConfig({...config, centerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Physical Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="text" className="input" style={{ paddingLeft: '2.5rem' }}
                      value={config.centerLocation} 
                      onChange={e => setConfig({...config, centerLocation: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Admin Contact Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="text" className="input" style={{ paddingLeft: '2.5rem' }}
                      value={config.contactNumber} 
                      onChange={e => setConfig({...config, contactNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={20} /> SMS & Alerts</h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Enable SMS Reminders</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically queue reminders for new appointments</div>
                  </div>
                  <input 
                    type="checkbox" style={{ width: '24px', height: '24px' }}
                    checked={config.smsReminders}
                    onChange={e => setConfig({...config, smsReminders: e.target.checked})}
                  />
                </div>
                <div>
                  <label className="label">Default SMS Template</label>
                  <textarea 
                    className="input" style={{ minHeight: '100px', resize: 'vertical' }}
                    value={config.smsTemplate}
                    onChange={e => setConfig({...config, smsTemplate: e.target.value})}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Available placeholders: {"{patient}"}, {"{date}"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} /> Clinical Parameters</h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label className="label">Low Stock Threshold</label>
                  <input 
                    type="number" className="input" 
                    value={config.lowStockThreshold}
                    onChange={e => setConfig({...config, lowStockThreshold: parseInt(e.target.value)})}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Items below this quantity will trigger a warning on the inventory dashboard.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Walk-in Clinical Registration</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow staff to register new profiles during check-in</div>
                  </div>
                  <input 
                    type="checkbox" style={{ width: '24px', height: '24px' }}
                    checked={config.allowManualRegistration}
                    onChange={e => setConfig({...config, allowManualRegistration: e.target.checked})}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={20} /> Infrastructure</h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #fecaca', background: '#fff5f5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <AlertTriangle size={18} /> Danger Zone
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '1rem' }}>Deleting or resetting the patient database is irreversible. Please ensure you have a backup of the 'patients' and 'encounters' tables before proceeding.</p>
                  <button className="btn" style={{ background: '#dc2626', color: 'white', border: 'none' }}>Empty Clinical Cache</button>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Backup & Sync</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Download a snapshot of the current clinical records in CSV format.</p>
                  <button className="btn btn-secondary">Export All Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
