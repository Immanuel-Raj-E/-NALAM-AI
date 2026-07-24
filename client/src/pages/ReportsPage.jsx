import { useState, useEffect } from 'react';
import { reportAPI, patientAPI } from '../services/api';
import { Upload, FileText, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ patient: '', reportName: '', reportType: 'Blood Test', reportDate: new Date().toISOString().split('T')[0] });
  const [file, setFile] = useState(null);

  useEffect(() => {
    Promise.all([reportAPI.getAll({}), patientAPI.getAll({ limit: 100 })]).then(([rRes, pRes]) => {
      setReports(rRes.data.data);
      setPatients(pRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      const res = await reportAPI.create(fd);
      setReports(prev => [res.data.data, ...prev]);
      setShowModal(false);
      setFile(null);
      setForm({ patient: '', reportName: '', reportType: 'Blood Test', reportDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await reportAPI.delete(id);
    setReports(prev => prev.filter(r => r._id !== id));
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Medical Reports</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Upload and analyze patient medical reports with OCR + AI</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Upload size={15} /> Upload Report</button>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.25 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No reports yet</p>
            <p style={{ fontSize: 13 }}>Upload a patient's medical report to get AI-powered analysis</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map(r => (
              <div key={r._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{r.reportName || r.fileName || 'Medical Report'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                        {r.patient?.name} · {new Date(r.reportDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge badge-blue">{r.reportType}</span>
                      <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                        {expandedId === r._id ? <><ChevronUp size={14} />Hide</> : <><ChevronDown size={14} />View Analysis</>}
                      </button>
                      <button onClick={() => handleDelete(r._id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Abnormal values */}
                  {r.abnormalValues?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {r.abnormalValues.map((av, i) => (
                        <div key={i} style={{
                          background: av.status === 'High' ? '#fee2e2' : '#fef9c3',
                          borderRadius: 8, padding: '6px 10px', fontSize: 12
                        }}>
                          <span style={{ fontWeight: 700, color: av.status === 'High' ? '#dc2626' : '#ca8a04' }}>{av.parameter}: {av.value}</span>
                          <span style={{ color: '#94a3b8' }}> (Normal: {av.normalRange})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {expandedId === r._id && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: 20, background: '#f8fafc' }}>
                    {/* Medical Report Description & Clinical Summary */}
                    {r.aiSummary && (
                      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={16} /> Medical Report Description & Clinical Summary
                        </div>
                        <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7 }}>{r.aiSummary}</p>
                      </div>
                    )}

                    {/* Important Findings */}
                    {r.importantFindings?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>📋 Important Findings</div>
                        {r.importantFindings.map((f, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0' }}>
                            <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OCR Text */}
                    {r.ocrText && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>📄 Extracted Text (OCR)</div>
                        <pre style={{ fontSize: 12, color: '#64748b', background: 'white', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0', maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>
                          {r.ocrText}
                        </pre>
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
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Upload Medical Report</h3>
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
                  <label className="form-label">Report Name</label>
                  <input className="form-input" placeholder="e.g. CBC Report" value={form.reportName} onChange={e => upd('reportName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select className="form-select" value={form.reportType} onChange={e => upd('reportType', e.target.value)}>
                    {['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Urine Test', 'ECG', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Report Date</label>
                  <input type="date" className="form-input" value={form.reportDate} onChange={e => upd('reportDate', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Upload File</label>
                <label className="upload-area" style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: '#16a34a' }}>
                      <CheckCircle size={20} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>Click or drag file here</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>JPG, PNG, PDF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Processing OCR...</> : <><Upload size={15} />Upload & Analyze</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
