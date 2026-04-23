import Dexie from 'dexie';

export const db = new Dexie('BHCMSDatabase');

db.version(1).stores({
  patients: '++id, philhealth_no, full_name, priority_group, dob, sex, purok_address, contact_number',
  encounters: '++id, patient_id, encounter_date, time_in, chief_complaint, diagnosis, vitals, priority, status',
  inventory: '++id, item_name, category, quantity_on_hand, expiration_date',
});
