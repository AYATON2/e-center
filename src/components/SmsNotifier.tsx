"use client";

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function SmsNotifier() {
  // Ref to prevent overlapping execution
  const isChecking = useRef(false);

  useEffect(() => {
    const checkAndSendSMS = async () => {
      if (isChecking.current) return;
      isChecking.current = true;
      
      try {
        const { data: encounters } = await supabase.from('encounters').select('*').eq('status', 'Completed').eq('sms_reminder_sent', false);
        if (!encounters || encounters.length === 0) {
          isChecking.current = false;
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        for (const enc of encounters) {
          // If they have an appointment tomorrow and we haven't sent a reminder yet
          if (enc.next_appointment === tomorrowStr && !enc.sms_reminder_sent) {
            const { data: patient } = await supabase.from('patients').select('*').eq('id', enc.patient_id).single();
            if (patient && patient.contact_number) {
              
              const msg = `Hi ${patient.full_name}, this is a reminder from BHCMS for your upcoming check-up tomorrow (${tomorrowStr}). Please arrive early.`;
              
              const res = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumber: patient.contact_number,
                  message: msg,
                  patientName: patient.full_name
                })
              });
              
              if (res.ok) {
                // Mark as sent in Supabase to avoid spamming
                await supabase.from('encounters').update({ sms_reminder_sent: true }).eq('id', enc.id);
                alert(`🔔 SMS Reminder Sent to ${patient.full_name} (${patient.contact_number}) for tomorrow's appointment!`);
              }
            }
          }
        }
      } catch (err) {
        console.error("SMS Error:", err);
      }
      
      isChecking.current = false;
    };

    // Run check immediately on load/data-update, and setup interval
    checkAndSendSMS();
    const interval = setInterval(checkAndSendSMS, 10000); // check every 10 seconds for demo
    return () => clearInterval(interval);

  }, []);

  return null; // Invisible background component
}
