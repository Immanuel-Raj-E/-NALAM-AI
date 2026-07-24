import { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2, Calendar } from 'lucide-react';
import { medicineAPI } from '../services/api';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [form, setForm] = useState({ name: '', genericName: '', category: '', quantity: '', unit: 'Tablets', lowStockThreshold: 10, expiryDate: '', batchNumber: '', supplier: '' });

  const fetchMedicines = async () => {
    try {
      const res = await medicineAPI.getAll({ search: search || undefined, lowStock: showLowOnly ? 'true' : undefined });
      setMedicines(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines(); }, [search, showLowOnly]);

  const openAdd = () => {
    setEditMed(null);
    setForm({ name: '', genericName: '', category: '', quantity: '', unit: 'Tablets', lowStockThreshold: 10, expiryDate: '', batchNumber: '', supplier: '' });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditMed(m);
    setForm({ ...m, expiryDate: m.expiryDate ? new Date(m.expiryDate).toISOString().split('T')[0] : '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this medicine?')) return;
    await medicineAPI.delete(id);
    setMedicines(prev => prev.filter(m => m._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, quantity: parseInt(form.quantity), lowStockThreshold: parseInt(form.lowStockThreshold) };
    if (editMed) { await medicineAPI.update(editMed._id, data); }
    else { await medicineAPI.create(data); }
    setShowModal(false);
    fetchMedicines();
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  const lowStockCount = medicines.filter(m => m.quantity <= m.lowStockThreshold).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Medicine Inventory</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Track medicine stock and expiry dates</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Medicine</button>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Items', value: medicines.length, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Low Stock', value: lowStockCount, bg: '#fef9c3', color: '#ca8a04' },
            { label: 'Expiring Soon', value: medicines.filter(m => isExpiringSoon(m.expiryDate)).length, bg: '#fef2f2', color: '#dc2626' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px 20px', border: `1px solid ${color}22` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} />
            <input className="form-input" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            onClick={() => setShowLowOnly(!showLowOnly)}
            style={{
              padding: '9px 16px', borderRadius: 10, border: '1.5px solid',
              borderColor: showLowOnly ? '#ef4444' : '#e2e8f0',
              background: showLowOnly ? '#fee2e2' : 'white',
              color: showLowOnly ? '#dc2626' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <AlertTriangle size={14} /> Low Stock Only
          </button>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : medicines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p>No medicines found</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Unit</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(med => {
                    const low = med.quantity <= med.lowStockThreshold;
                    const expired = isExpired(med.expiryDate);
                    const expiring = isExpiringSoon(med.expiryDate);

                    return (
                      <tr key={med._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{med.name}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{med.genericName}</div>
                        </td>
                        <td><span className="badge badge-blue">{med.category || 'General'}</span></td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 16, color: low ? '#ef4444' : '#16a34a' }}>{med.quantity}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Min: {med.lowStockThreshold}</div>
                        </td>
                        <td style={{ fontSize: 13 }}>{med.unit}</td>
                        <td>
                          <div style={{ fontSize: 13, color: expired ? '#ef4444' : expiring ? '#f59e0b' : '#1e293b', fontWeight: expired || expiring ? 700 : 400 }}>
                            {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('en-IN') : '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {expired && <span className="badge badge-red">Expired</span>}
                            {!expired && expiring && <span className="badge badge-yellow">Expiring Soon</span>}
                            {low && <span className="badge badge-orange">Low Stock</span>}
                            {!low && !expired && !expiring && <span className="badge badge-green">OK</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(med)} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563eb' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDelete(med._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>{editMed ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Medicine Name *</label>
                <input className="form-input" placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={e => upd('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Generic Name</label>
                <input className="form-input" placeholder="Generic name" value={form.genericName} onChange={e => upd('genericName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="e.g. Antibiotic" value={form.category} onChange={e => upd('category', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input type="number" className="form-input" placeholder="Current stock" value={form.quantity} onChange={e => upd('quantity', e.target.value)} required min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={form.unit} onChange={e => upd('unit', e.target.value)}>
                  {['Tablets', 'Capsules', 'Bottles', 'Sachets', 'Vials', 'Ampoules', 'Strips', 'Tubes', 'Inhalers'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert (below)</label>
                <input type="number" className="form-input" value={form.lowStockThreshold} onChange={e => upd('lowStockThreshold', e.target.value)} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input type="date" className="form-input" value={form.expiryDate} onChange={e => upd('expiryDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input className="form-input" placeholder="Batch #" value={form.batchNumber} onChange={e => upd('batchNumber', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Supplier</label>
                <input className="form-input" placeholder="Supplier name" value={form.supplier} onChange={e => upd('supplier', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editMed ? 'Update' : 'Add Medicine'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
