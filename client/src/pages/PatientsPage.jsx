import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye, AlertTriangle, User } from 'lucide-react';
import { patientAPI } from '../services/api';

const RISK_COLORS = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-green' };
const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Female', phone: '', address: '', village: '',
    district: '', bloodGroup: 'Unknown', medicalConditions: '', allergies: '',
    riskLevel: 'Low', pregnancyStatus: 'Not Applicable'
  });
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAll({ search, riskLevel: riskFilter || undefined });
      setPatients(res.data.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => {
    setEditPatient(null);
    setFormData({ name: '', age: '', gender: 'Female', phone: '', address: '', village: '', district: '', bloodGroup: 'Unknown', medicalConditions: '', allergies: '', riskLevel: 'Low', pregnancyStatus: 'Not Applicable' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setFormData({
      ...p,
      medicalConditions: p.medicalConditions?.join(', ') || '',
      allergies: p.allergies?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this patient?')) return;
    await patientAPI.delete(id);
    fetchPatients();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      age: parseInt(formData.age),
      medicalConditions: formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean),
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editPatient) {
      await patientAPI.update(editPatient._id, data);
    } else {
      await patientAPI.create(data);
    }
    setShowModal(false);
    fetchPatients();
  };

  const upd = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Patients ({patients.length})</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Manage all patients under your care</p>
        </div>
        <button className="btn-primary" onClick={openAdd} id="add-patient-btn">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input className="form-input" placeholder="Search by name, phone, village..." value={search} onChange={e => setSearch(e.target.value)} id="patient-search" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} color="#64748b" />
            {['', 'High', 'Medium', 'Low'].map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1.5px solid',
                  borderColor: riskFilter === r ? '#16a34a' : '#e2e8f0',
                  background: riskFilter === r ? '#dcfce7' : 'white',
                  color: riskFilter === r ? '#16a34a' : '#64748b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              <User size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No patients found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Add your first patient to get started</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age / Gender</th>
                    <th>Village</th>
                    <th>Blood Group</th>
                    <th>Risk Level</th>
                    <th>Conditions</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.phone}</div>
                      </td>
                      <td>{p.age} yrs · {p.gender}</td>
                      <td>{p.village}, {p.district}</td>
                      <td><span className="badge badge-blue">{p.bloodGroup}</span></td>
                      <td>
                        <span className={`badge ${RISK_COLORS[p.riskLevel]}`}>
                          {p.riskLevel === 'High' && <AlertTriangle size={10} />}
                          {p.riskLevel}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b', maxWidth: 180 }}>
                        {p.medicalConditions?.slice(0, 2).join(', ') || '—'}
                        {p.medicalConditions?.length > 2 && ` +${p.medicalConditions.length - 2}`}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>
                        {p.lastVisitDate ? new Date(p.lastVisitDate).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => navigate(`/patients/${p._id}`)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#16a34a' }} title="View">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(p)} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563eb' }} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
              {editPatient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Patient name" value={formData.name} onChange={e => upd('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" className="form-input" placeholder="Age" value={formData.age} onChange={e => upd('age', e.target.value)} required min={0} max={150} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-select" value={formData.gender} onChange={e => upd('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="Mobile number" value={formData.phone} onChange={e => upd('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={formData.bloodGroup} onChange={e => upd('bloodGroup', e.target.value)}>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Village</label>
                <input className="form-input" placeholder="Village" value={formData.village} onChange={e => upd('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-input" placeholder="District" value={formData.district} onChange={e => upd('district', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="Full address" value={formData.address} onChange={e => upd('address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Risk Level</label>
                <select className="form-select" value={formData.riskLevel} onChange={e => upd('riskLevel', e.target.value)}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pregnancy Status</label>
                <select className="form-select" value={formData.pregnancyStatus} onChange={e => upd('pregnancyStatus', e.target.value)}>
                  <option>Not Applicable</option><option>Pregnant</option><option>Postpartum</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Medical Conditions (comma-separated)</label>
                <input className="form-input" placeholder="e.g. Diabetes, Hypertension" value={formData.medicalConditions} onChange={e => upd('medicalConditions', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Allergies (comma-separated)</label>
                <input className="form-input" placeholder="e.g. Penicillin, Aspirin" value={formData.allergies} onChange={e => upd('allergies', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editPatient ? 'Update Patient' : 'Add Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
