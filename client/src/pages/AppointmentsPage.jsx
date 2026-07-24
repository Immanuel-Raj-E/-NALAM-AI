import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Stethoscope, Edit2, Trash2, Clock } from 'lucide-react';
import { appointmentAPI, patientAPI } from '../services/api';

const STATUS_BADGE = { Scheduled: 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-red', Rescheduled: 'badge-yellow' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [formData, setFormData] = useState({
    patient: '', doctorName: '', doctorSpecialty: '', hospitalName: '',
    appointmentDate: '', appointmentTime: '09:00 AM', reason: '', status: 'Scheduled', isReferral: false,
  });

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll({}),
      patientAPI.getAll({ limit: 100 }),
    ]).then(([aRes, pRes]) => {
      setAppointments(aRes.data.data);
      setPatients(pRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return new Date(a.appointmentDate) >= new Date() && a.status === 'Scheduled';
    if (filter === 'completed') return a.status === 'Completed';
    if (filter === 'referral') return a.isReferral;
    return true;
  });

  const openAdd = () => {
    setEditAppt(null);
    setFormData({ patient: '', doctorName: '', doctorSpecialty: '', hospitalName: '', appointmentDate: '', appointmentTime: '09:00 AM', reason: '', status: 'Scheduled', isReferral: false });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditAppt(a);
    setFormData({ ...a, patient: a.patient?._id || a.patient, appointmentDate: new Date(a.appointmentDate).toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await appointmentAPI.delete(id);
    setAppointments(prev => prev.filter(a => a._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editAppt) {
      const res = await appointmentAPI.update(editAppt._id, formData);
      setAppointments(prev => prev.map(a => a._id === editAppt._id ? res.data.data : a));
    } else {
      const res = await appointmentAPI.create(formData);
      setAppointments(prev => [res.data.data, ...prev]);
    }
    setShowModal(false);
  };

  const upd = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Appointments</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Manage and book patient appointments</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Book Appointment</button>
      </div>

      <div className="page-content">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['referral', 'Referrals']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                borderColor: filter === val ? '#16a34a' : '#e2e8f0',
                background: filter === val ? '#dcfce7' : 'white',
                color: filter === val ? '#16a34a' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              {label} {filter === val && `(${filtered.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                <Calendar size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p>No appointments found</p>
              </div>
            ) : filtered.map(appt => (
              <div key={appt._id} className="card card-interactive" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{appt.patient?.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{appt.patient?.village}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${STATUS_BADGE[appt.status]}`}>{appt.status}</span>
                    {appt.isReferral && <span className="badge badge-purple">Referral</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <Stethoscope size={15} color="#64748b" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{appt.doctorName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{appt.doctorSpecialty}</div>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>{appt.hospitalName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Clock size={12} color="#64748b" />
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {appt.appointmentTime}
                    </span>
                  </div>
                </div>

                {appt.reason && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>📋 {appt.reason}</div>}

                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <button onClick={() => openEdit(appt)} style={{ flex: 1, padding: '7px', background: '#eff6ff', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#2563eb', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(appt._id)} style={{ flex: 1, padding: '7px', background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Trash2 size={12} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>{editAppt ? 'Edit Appointment' : 'Book New Appointment'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Patient *</label>
                <select className="form-select" value={formData.patient} onChange={e => upd('patient', e.target.value)} required>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.village}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor Name *</label>
                <input className="form-input" placeholder="Dr. Name" value={formData.doctorName} onChange={e => upd('doctorName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input className="form-input" placeholder="e.g. General Medicine" value={formData.doctorSpecialty} onChange={e => upd('doctorSpecialty', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Hospital Name</label>
                <input className="form-input" placeholder="Hospital/PHC name" value={formData.hospitalName} onChange={e => upd('hospitalName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={formData.appointmentDate} onChange={e => upd('appointmentDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" placeholder="09:00 AM" value={formData.appointmentTime} onChange={e => upd('appointmentTime', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Reason</label>
                <input className="form-input" placeholder="Purpose of appointment" value={formData.reason} onChange={e => upd('reason', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={formData.status} onChange={e => upd('status', e.target.value)}>
                  <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>Rescheduled</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                <input type="checkbox" id="isReferral" checked={formData.isReferral} onChange={e => upd('isReferral', e.target.checked)} style={{ width: 16, height: 16 }} />
                <label htmlFor="isReferral" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>This is a referral</label>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editAppt ? 'Update' : 'Book Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
