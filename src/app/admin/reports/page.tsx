"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FileText, Users, Activity, Heart, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface Stats {
  totalPatients: number;
  totalEncounters: number;
  completedEncounters: number;
  queuedEncounters: number;
  priorityGroups: Record<string, number>;
  genderStats: { Male: number; Female: number };
  philhealthCount: number;
  clearedCount: number;
}

export default function AdminReports() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalEncounters: 0,
    completedEncounters: 0,
    queuedEncounters: 0,
    priorityGroups: {},
    genderStats: { Male: 0, Female: 0 },
    philhealthCount: 0,
    clearedCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [ptRes, encRes] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('encounters').select('*')
      ]);

      if (ptRes.data && encRes.data) {
        const groups: Record<string, number> = {};
        const genders = { Male: 0, Female: 0 };
        let philhealth = 0;

        ptRes.data.forEach(p => {
          const pg = p.priority_group || 'General';
          groups[pg] = (groups[pg] || 0) + 1;
          if (p.sex === 'Male') genders.Male++;
          if (p.sex === 'Female') genders.Female++;
          if (p.philhealth_no && p.philhealth_no.trim() !== '') philhealth++;
        });

        setStats({
          totalPatients: ptRes.data.length,
          totalEncounters: encRes.data.length,
          completedEncounters: encRes.data.filter((e: any) => e.status === 'Completed').length,
          queuedEncounters: encRes.data.filter((e: any) => e.status === 'Queued').length,
          priorityGroups: groups,
          genderStats: genders,
          philhealthCount: philhealth,
          clearedCount: encRes.data.filter((e: any) => e.is_cleared).length
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading health analytics...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} style={{ color: 'var(--primary-color)' }}/> Health System Analytics
          </h1>
          <p className="page-description">Real-time charts and demographic data for barangay health monitoring</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} /> Export PDF Report
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Users size={24} /></div>
          <div>
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">Total Registered Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><Activity size={24} /></div>
          <div>
            <div className="stat-value">{stats.completedEncounters}</div>
            <div className="stat-label">Total Completed Cases</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle size={24} /></div>
          <div>
            <div className="stat-value">{stats.clearedCount}</div>
            <div className="stat-label">Successfully Cleared</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#991b1b' }}><Heart size={24} /></div>
          <div>
            <div className="stat-value">{stats.queuedEncounters}</div>
            <div className="stat-label">Patients in Online Queue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value">{Math.round((stats.completedEncounters / (stats.totalEncounters || 1)) * 100)}%</div>
            <div className="stat-label">Case Completion Rate</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Demographic Breakdown
          </h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Priority Group Distribution</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.priorityGroups).length > 0 ? (
                Object.entries(stats.priorityGroups).map(([group, count], index) => {
                  const percentage = (count / (stats.totalPatients || 1)) * 100;
                  const colors = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'];
                  const barColor = colors[index % colors.length];
                  
                  return (
                    <div key={group}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 600 }}>{group}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{count} Patients ({Math.round(percentage)}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: barColor, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No demographic data available.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Gender Ratio</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}><span>Male</span> <span>{stats.genderStats.Male}</span></div>
                    <div style={{ height: '6px', background: '#e0f2fe', borderRadius: '3px', marginTop: '4px' }}>
                      <div style={{ width: `${(stats.genderStats.Male / (stats.totalPatients || 1)) * 100}%`, height: '100%', background: '#0284c7', borderRadius: '3px'}}></div>
                    </div>
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}><span>Female</span> <span>{stats.genderStats.Female}</span></div>
                    <div style={{ height: '6px', background: '#fce7f3', borderRadius: '3px', marginTop: '4px' }}>
                      <div style={{ width: `${(stats.genderStats.Female / (stats.totalPatients || 1)) * 100}%`, height: '100%', background: '#db2777', borderRadius: '3px'}}></div>
                    </div>
                 </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>PhilHealth Coverage</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>{Math.round((stats.philhealthCount / (stats.totalPatients || 1)) * 100)}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.philhealthCount} Patients have PhilHealth ID</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Operational Efficiency
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Overview of staff activity and patient flow management through the digital platform.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Digital Coverage</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>100% Paperless Records</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All patient data is now synchronized with Supabase Cloud.</div>
            </div>
            
            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>SMS Notification Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Auto-Reminders</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automated appointment alerts are sent 24h before visits.</div>
            </div>

            <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>System Integrity</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Role-Based Access On</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Administrator, Nurse, and Staff access boundaries enforced.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
