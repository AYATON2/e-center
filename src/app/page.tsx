"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, Calendar, CheckCircle2, AlertCircle, Phone, ArrowRight, Shield, Stethoscope, HeartPulse, MapPin } from 'lucide-react';

export default function PublicLandingPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  // Check if center is open (8 AM to 5 PM, Mon-Fri)
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const day = now.getDay();
      
      if (day >= 1 && day <= 5 && hours >= 8 && hours < 17) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    
    // Fetch dynamic schedule
    const fetchSchedule = async () => {
      const { data } = await supabase.from('weekly_schedules').select('*').order('order_idx', { ascending: true });
      if (data) setWeeklySchedule(data);
    };
    fetchSchedule();
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 5%', borderBottom: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0369a1', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}>
            <Shield size={24} />
          </div>
          BHCMS Public
        </div>
        <button className="btn" onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, background: '#1e293b', color: 'white', borderRadius: '50px', padding: '0.6rem 1.5rem', transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(30, 41, 59, 0.3)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          Staff Login <ArrowRight size={16} />
        </button>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '7rem 5%', textAlign: 'center', position: 'relative', backgroundImage: 'linear-gradient(135deg, rgba(240, 249, 255, 0.6) 0%, rgba(224, 242, 254, 0.5) 50%, rgba(186, 230, 253, 0.6) 100%), url("/center-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: '#38bdf8', opacity: 0.2, filter: 'blur(60px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: '#818cf8', opacity: 0.15, filter: 'blur(80px)', borderRadius: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: isOpen ? '#dcfce7' : '#fee2e2', color: isOpen ? '#166534' : '#991b1b', borderRadius: '50px', fontWeight: 600, fontSize: '0.875rem', marginBottom: '2rem', border: `1px solid ${isOpen ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {isOpen ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {isOpen ? 'We are Currently OPEN (Closes at 5:00 PM)' : 'We are Currently CLOSED (Opens at 8:00 AM weekdays)'}
          </div>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Your Health, <br/>
            <span style={{ background: 'linear-gradient(to right, #0284c7, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Our Priority.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#0f172a', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: 1.7, fontWeight: 600, textShadow: '0 2px 10px rgba(255,255,255,0.7)' }}>
            Welcome to the official Barangay Health Center portal. Check our clinical schedules, upcoming targeted barangay programs, and public announcements directly online.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#schedule" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: '#0284c7', color: 'white', borderRadius: '50px', fontWeight: 600, boxShadow: '0 8px 15px rgba(2, 132, 199, 0.3)', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>View Clinical Schedule</a>
            <a href="#contact" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', color: '#0f172a', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50px', fontWeight: 600, transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}>Emergency Hotline</a>
          </div>
        </div>
      </section>

      {/* THREE CARDS / HIGHLIGHTS */}
      <section style={{ padding: '0 5%', marginTop: '-4.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.5)', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)' }}>
              <HeartPulse size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>Free Consultations</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>General check-ups and diagnostic assessments provided purely free of charge by our trained rural health physicians.</p>
          </div>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.5)', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', margin: '0 auto 1.5rem', transform: 'rotate(5deg)' }}>
              <Stethoscope size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>Maternal Care</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>Comprehensive pre-natal and post-natal care keeping both mothers and newborns safe and healthy.</p>
          </div>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.5)', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', margin: '0 auto 1.5rem', transform: 'rotate(-5deg)' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>Swift Queuing</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>Receive SMS reminders when your schedule changes, and experience an optimized patient queue flow.</p>
          </div>

        </div>
      </section>

      {/* SCHEDULE SECTION */}
      <section id="schedule" style={{ padding: '8rem 5% 6rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Weekly Schedule</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Avoid long lines by visiting on the day assigned to your specific health need.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           {weeklySchedule.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '1.1rem' }}>Loading live schedule...</div>
           ) : (
             weeklySchedule.map((item, index) => {
               const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
               const color = colors[index % colors.length];
               
               return (
                 <div key={item.id || item.day} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', padding: '1.5rem 2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', borderLeft: `6px solid ${color}`, transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{ width: '180px', fontWeight: 800, color: color, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                      <Calendar size={20} opacity={0.8}/> {item.day}
                    </div>
                    <div style={{ flexGrow: 1, fontWeight: 700, fontSize: '1.2rem', color: '#1e293b' }}>{item.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '50px' }}>
                      <Clock size={16} color={color}/> {item.time}
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </section>

      {/* LOCATION & MAP SECTION */}
      <section id="location" style={{ padding: '6rem 5%', background: '#f8fafc', borderTop: '1px solid #e2e8f0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Visit the Center</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>We are conveniently located in the heart of Pianing. Drop by for consultations, maternal care, or general check-ups. Use the map to get live GPS navigation directly to our doorstep.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '12px', color: '#0284c7' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Pianing Health Center</div>
                  <div style={{ color: '#64748b', lineHeight: 1.5 }}>Beside Pianing Covered Court<br/>Barangay Pianing, Butuan City<br/>Agusan del Norte, Philippines</div>
                </div>
              </div>
            </div>
            
            <a href="https://maps.google.com/?q=Pianing+Covered+Court,+Butuan+City" target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.9rem 2rem', background: 'linear-gradient(to right, #0284c7, #38bdf8)', color: 'white', fontWeight: 600, borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)', transition: 'all 0.3s ease', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Open in Google Maps <ArrowRight size={18} />
            </a>
          </div>

          <div style={{ flex: '1 1 500px', height: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src="https://maps.google.com/maps?q=Pianing+Covered+Court,+Butuan+City&t=k&z=17&ie=UTF8&iwloc=&output=embed">
            </iframe>
          </div>

        </div>
      </section>

      {/* FOOTER & EMERGENCY */}
      <footer id="contact" style={{ background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, #38bdf8, #818cf8, #f472b6)' }}></div>
        
        <div style={{ padding: '5rem 5% 3rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Emergency Hotlines</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Available 24/7 for barangay medical emergencies.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
               <div style={{ background: '#ef4444', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}><Phone size={20} /></div>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>LGU Disaster Desk</div>
                 <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.25rem' }}>143-0000</div>
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
               <div style={{ background: '#3b82f6', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}><Phone size={20} /></div>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Rural Ambulance</div>
                 <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.25rem' }}>911-BH</div>
               </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <Shield size={20} color="#64748b" />
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>&copy; {new Date().getFullYear()} Barangay Health Center Management System. Powered by Next.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
