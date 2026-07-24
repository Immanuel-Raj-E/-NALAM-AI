import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Heart, Pill, Calendar, Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import { patientAPI, healthRecordAPI, appointmentAPI } from '../services/api';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '', symptoms: '', diagnosis: '', doctorNotes: '',
    bloodPressure: '', temperature: '', weight: '', height: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, aRes] = await Promise.all([
          patientAPI.getOne(id),
          healthRecordAPI.getByPatient(id),
          appointmentAPI.getAll({ patientId: id }),
        ]);
        setPatient(pRes.data.data);
        setRecords(rRes.data.data);
        setAppointments(aRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addRecord = async (e) => {
    e.preventDefault();
    const data = {
      ...recordForm,
      symptoms: recordForm.symptoms.split(',').map(s => s.trim()).filter(Boolean),
    };
    await healthRecordAPI.create(id, data);
    const res = await healthRecordAPI.getByPatient(id);
    setRecords(res.data.data);
    setShowRecordModal(false);
  };

  const deleteRecord = async (rid) => {
    if (!window.confirm('Delete this record?')) return;
    await healthRecordAPI.delete(rid);
    setRecords(records.filter(r => r._id !== rid));
  };

  const upd = (k, v) => setRecordForm(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!patient) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Patient not found</div>;

  const RISK_BADGE = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-green' };
  const tabs = ['overview', 'health records', 'appointments'];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/patients')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#64748b', display: 'flex' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{patient.name}</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>{patient.village} · {patient.phone}</p>
          </div>
        </div>
        <span className={`badge ${RISK_BADGE[patient.riskLevel]}`} style={{ fontSize: 13, padding: '6px 14px' }}>
          {patient.riskLevel} Risk
        </span>
      </div>

      <div className="page-content">
        {/* Profile Card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            <InfoItem icon={<User size={16} />} label="Age & Gender" value={`${patient.age} years · ${patient.gender}`} />
            <InfoItem icon={<Phone size={16} />} label="Phone" value={patient.phone || '—'} />
            <InfoItem icon={<MapPin size={16} />} label="Village" value={`${patient.village}, ${patient.district}`} />
            <InfoItem icon={<Heart size={16} />} label="Blood Group" value={patient.bloodGroup} />
            <InfoItem icon={<Pill size={16} />} label="Conditions" value={patient.medicalConditions?.join(', ') || 'None'} />
            <InfoItem icon={<Pill size={16} />} label="Allergies" value={patient.allergies?.join(', ') || 'None'} />
            <InfoItem icon={<Calendar size={16} />} label="Last Visit" value={patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString('en-IN') : 'Never'} />
            <InfoItem icon={<User size={16} />} label="Pregnancy" value={patient.pregnancyStatus} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                background: activeTab === tab ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Medical Conditions</h4>
              {patient.medicalConditions?.length > 0 ? patient.medicalConditions.map((c, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#374151' }}>• {c}</div>
              )) : <p style={{ color: '#94a3b8', fontSize: 13 }}>No conditions recorded</p>}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Allergies</h4>
              {patient.allergies?.length > 0 ? patient.allergies.map((a, i) => (
                <span key={i} className="badge badge-red" style={{ marginRight: 6, marginBottom: 6 }}>{a}</span>
              )) : <p style={{ color: '#94a3b8', fontSize: 13 }}>No known allergies</p>}
            </div>
          </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'health records' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button className="btn-primary" onClick={() => setShowRecordModal(true)}>
                <Plus size={15} /> Add Visit Record
              </button>
            </div>
            {records.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p>No health records yet</p>
              </div>
            ) : records.map(r => (
              <div key={r._id} className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{r.chiefComplaint || 'Visit Record'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(r.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <button onClick={() => deleteRecord(r._id)} className="btn-danger" style={{ padding: '6px 10px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {r.bloodPressure && <SmallInfo label="BP" value={r.bloodPressure} />}
                  {r.temperature && <SmallInfo label="Temp" value={r.temperature} />}
                  {r.weight && <SmallInfo label="Weight" value={r.weight} />}
                  {r.height && <SmallInfo label="Height" value={r.height} />}
                </div>
                {r.diagnosis && <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#166534' }}><strong>Diagnosis:</strong> {r.diagnosis}</div>}
                {r.doctorNotes && <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#475569', marginTop: 8 }}><strong>Notes:</strong> {r.doctorNotes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead><tr><th>Doctor</th><th>Hospital</th><th>Date & Time</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No appointments</td></tr>
                  ) : appointments.map(a => (
                    <tr key={a._id}>
                      <td><div style={{ fontWeight: 600 }}>{a.doctorName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{a.doctorSpecialty}</div></td>
                      <td style={{ fontSize: 13 }}>{a.hospitalName}</td>
                      <td style={{ fontSize: 13 }}>{new Date(a.appointmentDate).toLocaleDateString('en-IN')} · {a.appointmentTime}</td>
                      <td style={{ fontSize: 13 }}>{a.reason}</td>
                      <td><span className={`badge ${a.status === 'Completed' ? 'badge-green' : a.status === 'Cancelled' ? 'badge-red' : 'badge-blue'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showRecordModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRecordModal(false)}>
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 18 }}>Add Visit Record</h3>
            <form onSubmit={addRecord} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Visit Date</label>
                  <input type="date" className="form-input" value={recordForm.visitDate} onChange={e => upd('visitDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chief Complaint</label>
                  <input className="form-input" placeholder="Main symptom/complaint" value={recordForm.chiefComplaint} onChange={e => upd('chiefComplaint', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Pressure</label>
                  <input className="form-input" placeholder="e.g. 120/80" value={recordForm.bloodPressure} onChange={e => upd('bloodPressure', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Temperature</label>
                  <input className="form-input" placeholder="e.g. 98.6°F" value={recordForm.temperature} onChange={e => upd('temperature', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight</label>
                  <input className="form-input" placeholder="e.g. 55 kg" value={recordForm.weight} onChange={e => upd('weight', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input className="form-input" placeholder="e.g. 158 cm" value={recordForm.height} onChange={e => upd('height', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Symptoms (comma-separated)</label>
                  <input className="form-input" placeholder="Fever, Cough, Headache" value={recordForm.symptoms} onChange={e => upd('symptoms', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Diagnosis</label>
                  <input className="form-input" placeholder="Doctor's diagnosis" value={recordForm.diagnosis} onChange={e => upd('diagnosis', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Doctor Notes</label>
                  <textarea className="form-input" rows={3} placeholder="Clinical notes..." value={recordForm.doctorNotes} onChange={e => upd('doctorNotes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRecordModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}
