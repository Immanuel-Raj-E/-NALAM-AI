import { useState, useEffect } from 'react';
import { vaccinationAPI, patientAPI } from '../services/api';
import { Plus, Syringe, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  Completed: { badge: 'badge-green', icon: <CheckCircle2 size={13} />, border: '#16a34a' },
  Pending: { badge: 'badge-blue', icon: <Clock size={13} />, border: '#0ea5e9' },
  Overdue: { badge: 'badge-red', icon: <AlertTriangle size={13} />, border: '#ef4444' },
  Skipped: { badge: 'badge-gray', icon: null, border: '#94a3b8' },
};

export default function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', vaccineName: '', vaccineType: '', doseNumber: 1, scheduledDate: '', administeredDate: '', status: 'Pending', administeredBy: '', location: '', notes: '' });

  useEffect(() => {
    Promise.all([vaccinationAPI.getAll({}), patientAPI.getAll({ limit: 100 })]).then(([vRes, pRes]) => {
      setVaccinations(vRes.data.data);
      setPatients(pRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = vaccinations.filter(v => filter === 'all' || v.status === filter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await vaccinationAPI.create(form);
    setVaccinations(prev => [res.data.data, ...prev]);
    setShowModal(false);
  };

  const markComplete = async (id) => {
    const res = await vaccinationAPI.update(id, { status: 'Completed', administeredDate: new Date() });
    setVaccinations(prev => prev.map(v => v._id === id ? res.data.data : v));
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const counts = { all: vaccinations.length, Completed: vaccinations.filter(v => v.status === 'Completed').length, Pending: vaccinations.filter(v => v.status === 'Pending').length, Overdue: vaccinations.filter(v => v.status === 'Overdue').length };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Vaccination Tracker</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Track and manage patient vaccinations</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Record</button>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total', value: counts.all, color: '#0ea5e9', bg: '#e0f2fe' },
            { label: 'Completed', value: counts.Completed, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Pending', value: counts.Pending, color: '#2563eb', bg: '#dbeafe' },
            { label: 'Overdue', value: counts.Overdue, color: '#ef4444', bg: '#fee2e2' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${color}22` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {['all', 'Pending', 'Completed', 'Overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
              borderColor: filter === s ? '#16a34a' : '#e2e8f0',
              background: filter === s ? '#dcfce7' : 'white',
              color: filter === s ? '#16a34a' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
            }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                <Syringe size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p>No vaccination records</p>
              </div>
            ) : filtered.map(v => {
              const style = STATUS_STYLES[v.status] || STATUS_STYLES.Pending;
              return (
                <div key={v._id} className="card" style={{ padding: 18, borderTop: `3px solid ${style.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{v.vaccineName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Dose {v.doseNumber} · {v.vaccineType}</div>
                    </div>
                    <span className={`badge ${style.badge}`} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {style.icon}{v.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    👤 {v.patient?.name}
                    <span style={{ fontWeight: 400, color: '#94a3b8' }}> · {v.patient?.village}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 16, marginBottom: 12 }}>
                    {v.scheduledDate && <span>📅 Scheduled: {new Date(v.scheduledDate).toLocaleDateString('en-IN')}</span>}
                    {v.administeredDate && <span>✅ Done: {new Date(v.administeredDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                  {v.status === 'Pending' || v.status === 'Overdue' ? (
                    <button onClick={() => markComplete(v._id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: 13 }}>
                      <CheckCircle2 size={13} /> Mark as Administered
                    </button>
                  ) : (
                    <div style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', borderRadius: 8, padding: '8px 12px' }}>
                      ✅ Administered{v.administeredBy ? ` by ${v.administeredBy}` : ''}{v.location ? ` at ${v.location}` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Add Vaccination Record</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Patient *</label>
                <select className="form-select" value={form.patient} onChange={e => upd('patient', e.target.value)} required>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.village}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vaccine Name *</label>
                <input className="form-input" placeholder="e.g. BCG, MMR, TT" value={form.vaccineName} onChange={e => upd('vaccineName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vaccine Type</label>
                <input className="form-input" placeholder="e.g. Live Attenuated" value={form.vaccineType} onChange={e => upd('vaccineType', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dose Number</label>
                <input type="number" className="form-input" value={form.doseNumber} onChange={e => upd('doseNumber', e.target.value)} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input type="date" className="form-input" value={form.scheduledDate} onChange={e => upd('scheduledDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => upd('status', e.target.value)}>
                  <option>Pending</option><option>Completed</option><option>Overdue</option><option>Skipped</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="PHC / Hospital" value={form.location} onChange={e => upd('location', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Additional notes..." value={form.notes} onChange={e => upd('notes', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
