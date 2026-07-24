import { useState, useRef, useEffect } from 'react';
import { Bot, Send, AlertTriangle, Zap, RefreshCw, Pill, Printer, FileCheck, Plus, Check } from 'lucide-react';
import { aiAPI, patientAPI, prescriptionAPI } from '../services/api';

const QUICK_SYMPTOMS = ['Fever', 'Cough', 'Cold', 'Headache', 'Chest Pain', 'Diarrhea', 'Vomiting', 'Fatigue', 'Rash', 'Shortness of Breath', 'Abdominal Pain', 'Anaemia'];

const INITIAL_MSG = {
  id: 1,
  role: 'ai',
  text: 'Namaste! I am NALAM AI, your healthcare assistant.\n\nI can help you with:\n• Symptom assessment and risk evaluation\n• Generating AI Prescriptions for patients\n• Emergency contact information\n\nSelect a mode above or ask a health question to begin.',
  time: new Date(),
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mode, setMode] = useState('chat'); // chat | symptom-check | rx-generator

  // Patients for prescription generator
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [generatedRx, setGeneratedRx] = useState(null);
  const [savedRx, setSavedRx] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    patientAPI.getAll({ limit: 100 }).then(res => setPatients(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now(), role, text, time: new Date(), ...extra }]);
  };

  const sendChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    addMessage('user', msg);
    setLoading(true);
    try {
      const res = await aiAPI.chat({ message: msg });
      addMessage('ai', res.data.data.message, { type: res.data.data.type });
    } catch {
      addMessage('ai', 'Unable to connect to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runSymptomCheck = async () => {
    if (selectedSymptoms.length === 0) return;
    addMessage('user', `Checking symptoms: ${selectedSymptoms.join(', ')}`);
    setLoading(true);
    try {
      const res = await aiAPI.symptomCheck({ symptoms: selectedSymptoms });
      const d = res.data.data;
      const text = `Symptom Analysis Results:\n\nRisk Level: ${d.riskLevel}\n\nPossible Conditions:\n${d.possibleConditions.map(c => `• ${c}`).join('\n')}\n\nPrecautions:\n${d.precautions.map(p => `• ${p}`).join('\n')}\n\n${d.recommendation}\n\n${d.disclaimer}`;
      addMessage('ai', text, { riskLevel: d.riskLevel });
    } catch {
      addMessage('ai', 'Symptom check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrescription = async () => {
    const p = patients.find(pt => pt._id === selectedPatientId);
    if (!p && selectedSymptoms.length === 0) {
      alert('Please select a patient or add at least one symptom.');
      return;
    }
    setLoading(true);
    setSavedRx(false);
    try {
      const res = await aiAPI.generatePrescription({
        patientName: p ? p.name : 'Walk-in Patient',
        patientAge: p ? p.age : null,
        patientGender: p ? p.gender : null,
        symptoms: selectedSymptoms,
        diagnosis: customDiagnosis,
      });
      setGeneratedRx(res.data.data);
    } catch (err) {
      alert('Failed to generate AI prescription');
    } finally {
      setLoading(false);
    }
  };

  const saveToPatientPrescriptions = async () => {
    if (!generatedRx || !selectedPatientId) return;
    try {
      const p = patients.find(pt => pt._id === selectedPatientId);
      await prescriptionAPI.create({
        patient: selectedPatientId,
        doctorName: 'NALAM AI Decision System',
        hospitalName: `${p?.village || 'Mathur'} PHC`,
        prescriptionDate: new Date(),
        notes: `AI Generated Rx for ${generatedRx.workingDiagnosis}. Medicines: ${generatedRx.recommendedMedicines.map(m => m.name).join(', ')}`,
        extractedMedicines: generatedRx.recommendedMedicines,
        ocrText: JSON.stringify(generatedRx, null, 2),
      });
      setSavedRx(true);
    } catch (err) {
      alert('Failed to save prescription to database');
    }
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const getRiskColor = (level) => {
    if (level === 'High') return '#fee2e2';
    if (level === 'Medium') return '#fef9c3';
    return '#dcfce7';
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>NALAM AI Clinical Assistant & Prescription Generator</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Symptom Assessment · AI Prescription Generator · Healthcare Guidance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'chat', label: 'Chat Assistant' },
            { id: 'symptom-check', label: 'Symptom Checker' },
            { id: 'rx-generator', label: 'Prescription Generator' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid',
                borderColor: mode === m.id ? '#16a34a' : '#e2e8f0',
                background: mode === m.id ? '#16a34a' : 'white',
                color: mode === m.id ? 'white' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content" style={{ paddingTop: 0 }}>
        {mode === 'rx-generator' ? (
          /* PRESCRIPTION GENERATOR PAGE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            {/* Input Form Panel */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={20} /> AI Prescription Generator Form
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select
                    className="form-select"
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">Walk-in Patient / Manual Profile</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.age}y, {p.gender}) · {p.village}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Working Diagnosis (Optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Acute Upper Respiratory Tract Infection"
                    value={customDiagnosis}
                    onChange={e => setCustomDiagnosis(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Select Patient Symptoms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK_SYMPTOMS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: '1px solid',
                        borderColor: selectedSymptoms.includes(s) ? '#16a34a' : '#cbd5e1',
                        background: selectedSymptoms.includes(s) ? '#f0fdf4' : 'white',
                        color: selectedSymptoms.includes(s) ? '#16a34a' : '#475569',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {selectedSymptoms.includes(s) ? '✓ ' : '+ '}{s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGeneratePrescription}
                className="btn-primary"
                disabled={loading}
                style={{ padding: '12px 20px', fontSize: 14 }}
              >
                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating Prescription...</> : 'Generate AI Prescription'}
              </button>
            </div>

            {/* Generated Result Container */}
            {generatedRx && (
              <div className="card" style={{ padding: 28, background: 'white', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #16a34a', paddingBottom: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>NALAM AI HEALTHCARE PRESCRIPTION</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Rural Primary Healthcare & ASHA Clinical Decision Support</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{generatedRx.prescriptionId}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Date: {generatedRx.date}</div>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Patient Name</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{generatedRx.patientInfo.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Age / Gender</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{generatedRx.patientInfo.age} · {generatedRx.patientInfo.gender}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Working Diagnosis</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>{generatedRx.workingDiagnosis}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Recommended Medicines</div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedRx.recommendedMedicines.map((m, idx) => (
                          <tr key={idx}>
                            <td><strong style={{ color: '#16a34a' }}>{m.name}</strong></td>
                            <td>{m.dosage}</td>
                            <td><span className="badge badge-blue">{m.frequency}</span></td>
                            <td>{m.duration}</td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div style={{ background: '#fffbeb', borderRadius: 10, padding: 14, border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Precautions & Advice</div>
                    {generatedRx.precautions.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#78350f', marginBottom: 4 }}>• {p}</div>
                    ))}
                  </div>
                  <div style={{ background: '#f0f9ff', borderRadius: 10, padding: 14, border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 6 }}>Dietary Guidance</div>
                    <div style={{ fontSize: 12, color: '#0c4a6e' }}>{generatedRx.dietaryAdvice}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                  <div>{generatedRx.doctorNotes}</div>
                  <div style={{ marginTop: 4, fontWeight: 600, color: '#64748b' }}>{generatedRx.disclaimer}</div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button onClick={() => window.print()} className="btn-secondary">
                    <Printer size={15} /> Print Prescription
                  </button>
                  {selectedPatientId && (
                    <button onClick={saveToPatientPrescriptions} className="btn-primary" disabled={savedRx}>
                      {savedRx ? 'Saved to Patient Records' : 'Save to Patient Prescriptions'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CHAT & SYMPTOM ASSESSMENT VIEW */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, width: '100%', alignItems: 'start' }}>
            <div className="card" style={{ overflow: 'hidden', height: 600, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0f172a', padding: '14px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Bot size={20} color="#4ade80" />
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>NALAM AI Assistant</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Active Mode: {mode.toUpperCase()}</div>
                </div>
                <button onClick={() => setMessages([INITIAL_MSG])} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="chat-messages" style={{ flex: 1, padding: 20 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                    {msg.role === 'ai' && (
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bot size={14} color="white" />
                      </div>
                    )}
                    <div className={`chat-message ${msg.role}`} style={{ maxWidth: '85%', ...(msg.riskLevel ? { background: getRiskColor(msg.riskLevel) } : {}) }}>
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
                          )}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {loading && <div style={{ fontSize: 13, color: '#94a3b8' }}>AI is thinking...</div>}
                <div ref={messagesEndRef} />
              </div>

              {mode === 'chat' && (
                <div className="chat-input-area" style={{ padding: 14, background: '#f8fafc' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Type symptoms or medical questions..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                  />
                  <button onClick={sendChat} className="btn-primary" disabled={loading || !input.trim()}>
                    <Send size={15} /> Send
                  </button>
                </div>
              )}

              {mode === 'symptom-check' && (
                <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
                    Selected Symptoms: {selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {QUICK_SYMPTOMS.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        style={{
                          padding: '5px 10px', borderRadius: 16, border: '1px solid',
                          borderColor: selectedSymptoms.includes(s) ? '#16a34a' : '#cbd5e1',
                          background: selectedSymptoms.includes(s) ? '#f0fdf4' : 'white',
                          color: selectedSymptoms.includes(s) ? '#16a34a' : '#475569',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {selectedSymptoms.includes(s) ? '✓ ' : '+ '}{s}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn-primary"
                    disabled={selectedSymptoms.length === 0 || loading}
                    onClick={runSymptomCheck}
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  >
                    Run Symptom & Risk Assessment
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Medical Disclaimer</div>
                <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                  NALAM AI provides clinical decision support for ASHA workers. All suggestions should be confirmed by a Medical Officer.
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Emergency Helplines</div>
                {[
                  { name: 'Ambulance', num: '108', color: '#ef4444' },
                  { name: 'National Emergency', num: '112', color: '#dc2626' },
                  { name: 'ASHA Helpline', num: '104', color: '#2563eb' },
                  { name: 'Child Line', num: '1098', color: '#7c3aed' },
                ].map(({ name, num, color }) => (
                  <div key={num} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{name}</span>
                    <a href={`tel:${num}`} style={{ color, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{num}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
