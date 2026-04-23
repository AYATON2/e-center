"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Package, Plus, Syringe, Pill, Archive } from 'lucide-react';

export default function InventoryDashboard() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Medication',
    quantity_on_hand: 0,
    expiration_date: ''
  });

  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').order('item_name', { ascending: true });
    if (data) setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('inventory').insert([{
        ...formData,
        quantity_on_hand: Number(formData.quantity_on_hand)
      }]);
      if (error) throw error;
      
      setShowAddItem(false);
      setFormData({ item_name: '', category: 'Medication', quantity_on_hand: 0, expiration_date: '' });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStockAdj = async (id, currentQty, amount) => {
    const newQty = Math.max(0, currentQty + amount);
    await supabase.from('inventory').update({ quantity_on_hand: newQty }).eq('id', id);
    fetchInventory();
  };

  const getIconForCategory = (cat) => {
    switch(cat) {
      case 'Vaccine': return <Syringe size={16} />;
      case 'Medication': return <Pill size={16} />;
      default: return <Archive size={16} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Tracking</h1>
          <p className="page-description">Manage live Supabase stocks of vaccines, medications, and supplies</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddItem(!showAddItem)}>
          <Plus size={18} /> {showAddItem ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{color: 'var(--success-color)'}}><Pill size={24} /></div>
          <div>
            <div className="stat-value">{inventory.filter(i => i.category === 'Medication').length}</div>
            <div className="stat-label">Medications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{color: 'var(--primary-color)'}}><Syringe size={24} /></div>
          <div>
            <div className="stat-value">{inventory.filter(i => i.category === 'Vaccine').length}</div>
            <div className="stat-label">Vaccines</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{color: 'var(--warning-color)'}}><Archive size={24} /></div>
          <div>
            <div className="stat-value">{inventory.filter(i => i.category === 'Supply').length}</div>
            <div className="stat-label">General Supplies</div>
          </div>
        </div>
      </div>

      {showAddItem && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Add Inventory Item</h3>
          <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">Item Name</label>
              <input type="text" className="input" required value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} placeholder="e.g. Amoxicillin 500mg" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Medication">Medication</option>
                <option value="Vaccine">Vaccine</option>
                <option value="Supply">Supply</option>
              </select>
            </div>
            
            <div>
              <label className="label">Initial Quantity</label>
              <input type="number" className="input" required min="0" value={formData.quantity_on_hand} onChange={e => setFormData({...formData, quantity_on_hand: e.target.value})} />
            </div>
            <div>
              <label className="label">Expiration Date (if applicable)</label>
              <input type="date" className="input" value={formData.expiration_date} onChange={e => setFormData({...formData, expiration_date: e.target.value})} />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} /> Current Stock levels
        </h3>
        
        {inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p>No inventory items found in Supabase. Add some to get started.</p>
          </div>
        ) : (
          <div style={{ marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Item</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Qty / Stock</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expiration</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.item_name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {getIconForCategory(item.category)} {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: 600, color: item.quantity_on_hand < 50 ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                        {item.quantity_on_hand}
                      </span>
                      {item.quantity_on_hand < 50 && <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--danger-color)' }}>Low Stock</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {item.expiration_date || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleStockAdj(item.id, item.quantity_on_hand, -10)}>-10</button>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleStockAdj(item.id, item.quantity_on_hand, 50)}>+50</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
