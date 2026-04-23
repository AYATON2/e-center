import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function SendSmsModal({ patient, onClose }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  if (!patient) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: patient.contact_number || '0000000000', // fallback if empty
          message: message,
          patientName: patient.full_name
        })
      });

      if (res.ok) {
        setStatus({ type: 'success', text: 'SMS Sent Successfully!' });
        setTimeout(() => {
          onClose(); // close after short delay
        }, 1500);
      } else {
        setStatus({ type: 'error', text: 'Failed to send SMS.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="card animate-fade-in" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} /> Custom SMS
        </h2>
        
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          To: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{patient.full_name}</span> ({patient.contact_number || 'No number provided'})
        </div>

        <div>
          <label className="label">Message content</label>
          <textarea 
            className="input" 
            style={{ minHeight: '100px', resize: 'vertical', marginBottom: '1rem' }} 
            placeholder="Type your message here (e.g. Schedule is canceled...)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          ></textarea>
        </div>

        {status && (
          <div style={{ padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem', backgroundColor: status.type === 'error' ? '#fee2e2' : '#dcfce7', color: status.type === 'error' ? '#991b1b' : '#166534' }}>
            {status.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSending}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={isSending || !message.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} /> {isSending ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}
