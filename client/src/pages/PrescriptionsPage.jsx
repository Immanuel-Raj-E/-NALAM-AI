import { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI } from '../services/api';
import { Upload, ClipboardList, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ patient: '', doctorName: '', hospitalName: '', prescriptionDate: new Date().toISOString().split('T')[0], notes: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    Promise.all([prescriptionAPI.getAll({}), patientAPI.getAll({ limit: 100 })]).then(([pRes, ptRes]) => {
      setPrescriptions(pRes.data.data);
      setPatients(ptRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      const res = await prescriptionAPI.create(fd);
      setPrescriptions(prev => [res.data.data, ...prev]);
      setShowModal(false);
      setFile(null);
      setForm({ patient: '', doctorName: '', hospitalName: '', prescriptionDate: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete prescription?')) return;
    await prescriptionAPI.delete(id);
    setPrescriptions(prev => prev.filter(p => p._id !== id));
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Prescriptions</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Upload and track patient prescriptions with OCR</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Upload size={15} /> Upload Prescription</button>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : prescriptions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
            <ClipboardList size={48} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.25 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No prescriptions yet</p>
            <p style={{ fontSize: 13 }}>Upload patient prescriptions to digitize records</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {prescriptions.map(p => (
              <div key={p._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{p.patient?.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.patient?.village}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setExpandedId(expandedId === p._id ? null : p._id)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        {expandedId === p._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {expandedId === p._id ? 'Hide' : 'View'}
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                    👨‍⚕️ <strong>{p.doctorName}</strong>
                    {p.hospitalName && <> · {p.hospitalName}</>}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    📅 {new Date(p.prescriptionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {p.fileName && <> · 📄 {p.fileName}</>}
                  </div>
                </div>

                {expandedId === p._id && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: 16, background: '#f8fafc' }}>
                    {p.ocrText && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>📄 Extracted Text (OCR)</div>
                        <pre style={{ fontSize: 12, color: '#374151', background: 'white', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0', maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>
                          {p.ocrText}
                        </pre>
                      </div>
                    )}
                    {p.notes && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                        <p style={{ fontSize: 13, color: '#374151' }}>{p.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Upload Prescription</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-select" value={form.patient} onChange={e => upd('patient', e.target.value)} required>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.village}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input className="form-input" placeholder="Dr. Name" value={form.doctorName} onChange={e => upd('doctorName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input className="form-input" placeholder="Hospital" value={form.hospitalName} onChange={e => upd('hospitalName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prescription Date</label>
                  <input type="date" className="form-input" value={form.prescriptionDate} onChange={e => upd('prescriptionDate', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Upload File</label>
                <label className="upload-area" style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: '#16a34a' }}>
                      <CheckCircle size={20} /><span style={{ fontSize: 14, fontWeight: 600 }}>{file.name}</span>
                    </div>
                  ) : (
                    <div><Upload size={28} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Click to upload prescription</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>JPG, PNG, PDF accepted</p>
                    </div>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Additional notes" value={form.notes} onChange={e => upd('notes', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Uploading...</> : <><Upload size={15} />Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
