"use client";

import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export default function SmsNotifier() {
  const encounters = useLiveQuery(() => db.encounters.where('status').equals('Completed').toArray()) || [];
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  
  // Ref to prevent overlapping execution
  const isChecking = useRef(false);

  useEffect(() => {
    if (encounters.length === 0 || patients.length === 0) return;

    const checkAndSendSMS = async () => {
      if (isChecking.current) return;
      isChecking.current = true;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      for (const enc of encounters) {
        // If they have an appointment tomorrow and we haven't sent a reminder yet
        if (enc.next_appointment === tomorrowStr && !enc.sms_reminder_sent) {
          const patient = patients.find(p => p.id === enc.patient_id);
          if (patient && patient.contact_number) {
            
            const msg = `Hi ${patient.full_name}, this is a reminder from BHCMS for your upcoming check-up tomorrow (${tomorrowStr}). Please arrive early.`;
            
            try {
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
                // Mark as sent in Dexie to avoid spamming
                await db.encounters.update(enc.id, { sms_reminder_sent: true });
                // Alert the user on the screen so they know the background job fired
                alert(`🔔 SMS Reminder Sent to ${patient.full_name} (${patient.contact_number}) for tomorrow's appointment!`);
              }
            } catch (err) {
              console.error("SMS Error:", err);
            }
          }
        }
      }
      
      isChecking.current = false;
    };

    // Run check immediately on load/data-update, and setup interval
    checkAndSendSMS();
    const interval = setInterval(checkAndSendSMS, 10000); // check every 10 seconds for demo
    return () => clearInterval(interval);

  }, [encounters, patients]);

  return null; // Invisible background component
}
