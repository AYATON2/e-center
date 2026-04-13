async function seed() {
  const usersToCreate = [
    { email: 'admin@bhcms.com', password: 'Password123!', fullName: 'System Admin', role: 'Admin' },
    { email: 'nurse@bhcms.com', password: 'Password123!', fullName: 'Head Nurse', role: 'Nurse' },
    { email: 'staff@bhcms.com', password: 'Password123!', fullName: 'Front Desk', role: 'Staff' }
  ];

  for (const u of usersToCreate) {
    try {
      const res = await fetch('http://localhost:3000/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(u)
      });
      const data = await res.json();
      console.log('Result for ' + u.email + ':', data);
    } catch(err) {
      console.error(err.message);
    }
  }
}
seed();
