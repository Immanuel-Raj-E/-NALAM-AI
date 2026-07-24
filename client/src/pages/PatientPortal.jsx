import { useState, useEffect } from 'react';
import { patientAPI, healthRecordAPI, prescriptionAPI, appointmentAPI, vaccinationAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart, User, Activity, Pill, Calendar, Syringe, FileText, Phone,
  LogOut, Bot, Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Sparkles, MapPin, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // home | prescriptions | visits | appointments | ai-assistant

  // AI Chat state for patient Q&A
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, role: 'ai', text: `Namaste! 🙏 I am NALAM AI, your personal health assistant. You can ask me any health questions, symptom advice, or medicine instructions.` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch initial patient profiles
  useEffect(() => {
    patientAPI.getAll({ limit: 100 }).then(res => {
      const allPatients = res.data.data;
      setPatients(allPatients);
      if (allPatients.length > 0) {
        const match = allPatients.find(p => p.name.toLowerCase().includes(user?.name?.toLowerCase()) || user?.name?.toLowerCase().includes(p.name.toLowerCase()));
        setSelectedPatientId(match ? match._id : allPatients[0]._id);
      }
    }).finally(() => setLoading(false));
  }, [user]);

  // Load selected patient details
  useEffect(() => {
    if (!selectedPatientId) return;
    setLoading(true);
    Promise.all([
      patientAPI.getOne(selectedPatientId),
      healthRecordAPI.getByPatient(selectedPatientId),
      prescriptionAPI.getAll({ patientId: selectedPatientId }),
      appointmentAPI.getAll({ patientId: selectedPatientId }),
      vaccinationAPI.getAll({ patientId: selectedPatientId }),
    ]).then(([pRes, rRes, prRes, aRes, vRes]) => {
      setPatient(pRes.data.data);
      setRecords(rRes.data.data);
      setPrescriptions(prRes.data.data);
      setAppointments(aRes.data.data);
      setVaccinations(vRes.data.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedPatientId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await aiAPI.chat({ message: msg });
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: res.data.data.message }]);
    } catch {
      setChatMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: '⚠️ Unable to connect to AI assistant. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading && !patient) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Patient Top Header Bar */}
      <header style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c25 100%)',
        color: 'white', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={24} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>NALAM AI · Patient Care</div>
            <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Rural Healthcare Patient Portal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.role !== 'patient' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Preview Patient:</span>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                style={{ padding: '6px 12px', fontSize: 13, fontWeight: 700, color: '#16a34a', borderRadius: 10 }}
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.village})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 12 }}>
            <User size={16} color="#4ade80" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || patient?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>
        {patient && (
          <>
            {/* Patient Identity Banner & ASHA Worker Info Card */}
            <div className="card" style={{
              padding: 28, marginBottom: 24,
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white', borderRadius: 24, boxShadow: '0 8px 30px rgba(22,163,74,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 22, background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 900, color: '#16a34a', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>{patient.name}</h2>
                    <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                      {patient.age} Years · {patient.gender} · Blood Group: <strong>{patient.bloodGroup}</strong>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
                      📍 {patient.address || 'Village Road'}, {patient.village}, {patient.district}
                    </div>
                  </div>
                </div>

                {/* Assigned ASHA Worker Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  borderRadius: 16, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dcfce7' }}>
                    Assigned ASHA Worker
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>Meena Kumari</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>📍 PHC Mathur · Krishnagiri</div>
                  <div style={{ fontSize: 12, color: '#fef08a', fontWeight: 700, marginTop: 4 }}>📞 9876543210 (Helpline 104)</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { id: 'home', label: '🏠 Health Overview' },
                { id: 'prescriptions', label: '💊 Prescriptions & Medicines' },
                { id: 'visits', label: '🩺 Visit Records & History' },
                { id: 'appointments', label: '📅 Appointments & Vaccines' },
                { id: 'ai-assistant', label: '🤖 Ask NALAM AI Assistant' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '11px 20px', borderRadius: 14, border: '2px solid',
                    borderColor: activeTab === t.id ? '#16a34a' : '#e2e8f0',
                    background: activeTab === t.id ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'white',
                    color: activeTab === t.id ? 'white' : '#64748b',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    boxShadow: activeTab === t.id ? '0 4px 14px rgba(22,163,74,0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: HOME OVERVIEW */}
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Vitals Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7' }}>
                      <Activity size={24} color="#16a34a" />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{records.length}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Checkup Visits</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#e0f2fe' }}>
                      <Pill size={24} color="#0ea5e9" />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{prescriptions.length}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Active Prescriptions</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef9c3' }}>
                      <Calendar size={24} color="#ca8a04" />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{appointments.length}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Upcoming Visits</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f3e8ff' }}>
                      <Syringe size={24} color="#9333ea" />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>
                        {vaccinations.filter(v => v.status === 'Completed').length} / {vaccinations.length}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Vaccines Completed</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Medical Conditions */}
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Health Profile & Conditions</h3>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Diagnosed Conditions</div>
                      {patient.medicalConditions?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {patient.medicalConditions.map((c, i) => (
                            <span key={i} className="badge badge-blue" style={{ fontSize: 13, padding: '6px 12px' }}>{c}</span>
                          ))}
                        </div>
                      ) : <p style={{ color: '#94a3b8', fontSize: 13 }}>No chronic conditions recorded.</p>}
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Known Allergies</div>
                      {patient.allergies?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {patient.allergies.map((a, i) => (
                            <span key={i} className="badge badge-red" style={{ fontSize: 13, padding: '6px 12px' }}>{a}</span>
                          ))}
                        </div>
                      ) : <p style={{ color: '#94a3b8', fontSize: 13 }}>No known allergies.</p>}
                    </div>
                  </div>

                  {/* AI Personal Guidance */}
                  <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={20} /> AI Health Guidance for You
                    </h3>
                    <div style={{ fontSize: 14, color: '#14532d', lineHeight: 1.8 }}>
                      <p>• Drink 3 Litres of clean boiled water daily.</p>
                      {patient.medicalConditions?.includes('Anaemia') && (
                        <p>• Take Iron Folic Acid tablet daily after dinner with lemon juice or citrus fruits.</p>
                      )}
                      {patient.medicalConditions?.includes('Hypertension') && (
                        <p>• Avoid excess salt and fried snacks. Attend monthly BP monitoring at Mathur PHC.</p>
                      )}
                      <p>• Contact your ASHA Worker <strong>Meena Kumari (9876543210)</strong> or call <strong>108</strong> in an emergency.</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Numbers Banner */}
                <div className="card" style={{ padding: 20, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#92400e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={18} /> Emergency Helpline Contacts
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {[
                      { name: 'Ambulance', num: '108', color: '#ef4444' },
                      { name: 'National Emergency', num: '112', color: '#dc2626' },
                      { name: 'ASHA Health Line', num: '104', color: '#2563eb' },
                      { name: 'Child Helpline', num: '1098', color: '#7c3aed' },
                    ].map(e => (
                      <a key={e.num} href={`tel:${e.num}`} style={{ background: 'white', borderRadius: 12, padding: '10px 14px', textDecoration: 'none', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#78350f', fontWeight: 600 }}>{e.name}</span>
                        <strong style={{ color: e.color, fontSize: 16 }}>{e.num}</strong>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>My Prescriptions & Medicines</h3>
                {prescriptions.length === 0 ? (
                  <div className="card" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    <Pill size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600 }}>No prescriptions recorded yet.</p>
                  </div>
                ) : (
                  prescriptions.map(p => (
                    <div key={p._id} className="card" style={{ padding: 24, borderLeft: '4px solid #16a34a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>Dr. {p.doctorName}</div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>{p.hospitalName} · Date: {new Date(p.prescriptionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <span className="badge badge-green">Verified Prescription</span>
                      </div>
                      {p.notes && <div style={{ fontSize: 14, color: '#374151', background: '#f8fafc', padding: 14, borderRadius: 12, marginTop: 10 }}>{p.notes}</div>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: VISITS & LAB REPORTS */}
            {activeTab === 'visits' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>ASHA Visit Records & Lab History</h3>
                {records.length === 0 ? (
                  <div className="card" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No visit records found.</div>
                ) : (
                  records.map(r => (
                    <div key={r._id} className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{r.chiefComplaint || 'Health Checkup Visit'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                        Visited on {new Date(r.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Conducted by ASHA Worker Meena Kumari
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                        {r.bloodPressure && <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8 }}><span style={{ fontSize: 11, color: '#94a3b8' }}>BP:</span> <strong style={{ fontSize: 13 }}>{r.bloodPressure}</strong></div>}
                        {r.temperature && <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8 }}><span style={{ fontSize: 11, color: '#94a3b8' }}>Temp:</span> <strong style={{ fontSize: 13 }}>{r.temperature}</strong></div>}
                        {r.weight && <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8 }}><span style={{ fontSize: 11, color: '#94a3b8' }}>Weight:</span> <strong style={{ fontSize: 13 }}>{r.weight}</strong></div>}
                      </div>
                      {r.diagnosis && <div style={{ fontSize: 14, color: '#166534', background: '#f0fdf4', padding: 12, borderRadius: 10 }}><strong>Diagnosis:</strong> {r.diagnosis}</div>}
                      {r.doctorNotes && <div style={{ fontSize: 13, color: '#475569', marginTop: 10 }}><strong>Notes:</strong> {r.doctorNotes}</div>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: APPOINTMENTS & VACCINES */}
            {activeTab === 'appointments' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Appointments */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 14 }}>Upcoming Appointments</h3>
                  {appointments.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No appointments scheduled.</p> : (
                    appointments.map(a => (
                      <div key={a._id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Dr. {a.doctorName} ({a.doctorSpecialty})</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{a.hospitalName}</div>
                        <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                          📅 {new Date(a.appointmentDate).toLocaleDateString('en-IN')} · {a.appointmentTime}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Vaccines */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 14 }}>Vaccination Record</h3>
                  {vaccinations.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No vaccinations recorded.</p> : (
                    vaccinations.map(v => (
                      <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{v.vaccineName}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Dose {v.doseNumber}</div>
                        </div>
                        <span className={`badge ${v.status === 'Completed' ? 'badge-green' : 'badge-blue'}`}>{v.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: NALAM AI ASSISTANT CHAT */}
            {activeTab === 'ai-assistant' && (
              <div className="card" style={{ overflow: 'hidden', height: 600, display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Bot size={24} color="#4ade80" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>NALAM AI Health Chatbot</div>
                    <div style={{ fontSize: 12, color: '#4ade80' }}>Ask any health question, symptom advice or precautions</div>
                  </div>
                </div>

                <div className="chat-messages" style={{ flex: 1, padding: 20 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      {msg.role === 'ai' && (
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bot size={16} color="white" />
                        </div>
                      )}
                      <div className={`chat-message ${msg.role}`} style={{ maxWidth: '85%' }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div style={{ fontSize: 13, color: '#94a3b8' }}>AI is typing...</div>}
                </div>

                <div className="chat-input-area" style={{ padding: 16, background: '#f8fafc' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Ask about your health, medicines or symptoms..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  />
                  <button onClick={handleSendChat} className="btn-primary" disabled={chatLoading}>
                    <Send size={16} /> Send
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
