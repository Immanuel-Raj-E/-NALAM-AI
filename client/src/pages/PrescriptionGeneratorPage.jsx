import { useState, useEffect } from 'react';
import { patientAPI, medicineAPI, prescriptionAPI, aiAPI } from '../services/api';
import { Pill, Plus, Trash2, Printer, Check, Sparkles, User, HeartPulse } from 'lucide-react';

export default function PrescriptionGeneratorPage() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Minimal patient & symptom input state
  const [symptomsInput, setSymptomsInput] = useState('');
  const [diagnosisDescription, setDiagnosisDescription] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Meena Devi');
  const [hospitalName, setHospitalName] = useState('Mathur Primary Health Centre');

  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // AI Suggestions state (Integrated from Medical Report Analysis)
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Search & add custom medicine from database inventory
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [dose, setDose] = useState('10 Tablets');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('5 days');
  const [instructions, setInstructions] = useState('After meals');

  // Final prescription items list
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [issuedRx, setIssuedRx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState('');

  useEffect(() => {
    Promise.all([
      patientAPI.getAll({ limit: 200 }),
      medicineAPI.getAll({ limit: 200 }),
    ]).then(([pRes, mRes]) => {
      setPatients(pRes.data.data || []);
      setMedicines(mRes.data.data || []);
    });
  }, []);

  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  // Trigger AI Model Suggestions (E:\medical report analysis\Medical Report Analysis model)
  const handleGetAiSuggestions = async () => {
    if (!symptomsInput.trim()) {
      alert('Please type the patient symptoms (e.g. fever, headache, cough).');
      return;
    }
    setLoadingAi(true);
    try {
      const symptomsList = symptomsInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      const res = await aiAPI.generatePrescription({
        patientName: selectedPatient?.name || 'Patient',
        patientAge: selectedPatient?.age,
        patientGender: selectedPatient?.gender,
        symptoms: symptomsList,
        diagnosis: diagnosisDescription
      });

      setAiSuggestions(res.data.data);
      if (res.data.data.workingDiagnosis && !diagnosisDescription) {
        setDiagnosisDescription(res.data.data.workingDiagnosis);
      }
    } catch (err) {
      console.error('Failed to get AI suggestions', err);
      alert('Could not fetch AI suggestions. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Add AI suggested medicine directly to Rx (matching database inventory if present)
  const addAiMedicineToRx = (suggestedMed) => {
    const match = String(suggestedMed.dosage || '10').match(/\d+/);
    const parsedQty = match ? parseInt(match[0], 10) : 10;
    const inventoryMatch = medicines.find(m => m.name.toLowerCase().includes(suggestedMed.name.toLowerCase()) || suggestedMed.name.toLowerCase().includes(m.name.toLowerCase()));

    const newItem = {
      medicineId: inventoryMatch ? inventoryMatch._id : null,
      name: inventoryMatch ? inventoryMatch.name : suggestedMed.name,
      dosage: suggestedMed.dosage || '10 Tablets',
      quantityDeducted: parsedQty,
      frequency: suggestedMed.frequency || 'Twice daily',
      duration: suggestedMed.duration || '5 days',
      instructions: suggestedMed.instructions || 'After food'
    };

    setPrescriptionMedicines(prev => [...prev, newItem]);
  };

  // Add inventory database medicine to Rx
  const addInventoryMedToRx = () => {
    if (!selectedMed) {
      alert('Please select a medicine from the inventory search bar.');
      return;
    }
    const match = String(dose).match(/\d+/);
    const parsedQty = match ? parseInt(match[0], 10) : 1;

    const newItem = {
      medicineId: selectedMed._id,
      name: selectedMed.name,
      dosage: dose,
      quantityDeducted: parsedQty,
      frequency,
      duration,
      instructions
    };

    setPrescriptionMedicines(prev => [...prev, newItem]);
    setSelectedMed(null);
    setSearchTerm('');
  };

  const removeMedicine = (idx) => {
    setPrescriptionMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient.');
      return;
    }
    if (!symptomsInput.trim() && !diagnosisDescription.trim()) {
      alert('Please enter patient symptoms or clinical diagnosis.');
      return;
    }
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine to the prescription.');
      return;
    }

    setSubmitting(true);
    try {
      const rxNotes = `Symptoms: ${symptomsInput}. Diagnosis: ${diagnosisDescription || 'General Treatment'}. Medicines: ${prescriptionMedicines.map(m => `${m.name} (${m.dosage})`).join('; ')}`;

      const res = await prescriptionAPI.create({
        patient: selectedPatientId,
        doctorName,
        hospitalName,
        prescriptionDate: new Date(),
        notes: rxNotes,
        extractedMedicines: prescriptionMedicines,
        ocrText: JSON.stringify({ symptomsInput, diagnosisDescription, prescriptionMedicines }, null, 2),
      });

      setIssuedRx({
        id: res.data.data._id || `RX-${Date.now()}`,
        patientName: selectedPatient?.name,
        patientAge: selectedPatient?.age,
        patientGender: selectedPatient?.gender,
        symptomsInput,
        diagnosisDescription: diagnosisDescription || 'General Treatment',
        doctorName,
        hospitalName,
        medicines: prescriptionMedicines,
        date: new Date().toLocaleDateString('en-IN')
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!issuedRx || !issuedRx.id) return;
    setSendingWhatsapp(true);
    setWhatsappStatus('');
    try {
      await prescriptionAPI.sendWhatsapp(issuedRx.id);
      setWhatsappStatus('Sent successfully!');
    } catch (err) {
      console.error(err);
      setWhatsappStatus('Failed to send');
      alert(err.response?.data?.message || 'Failed to send WhatsApp message.');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill size={22} color="#7c3aed" /> Prescription Generator
        </h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          Select a patient, input symptoms for AI suggestions, and compose a digital prescription.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* LEFT COLUMN: Symptom Assessment & AI Advice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card 1: Patient and Symptoms Selection */}
          <div className="card" style={{ padding: 20, background: 'white', borderRadius: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} color="#7c3aed" /> Patient & Symptoms
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>Search Patient *</label>
                <input
                  className="form-input"
                  placeholder="Search name, village, or phone..."
                  value={patientSearchTerm}
                  onChange={e => {
                    setPatientSearchTerm(e.target.value);
                    if (!e.target.value) setSelectedPatientId('');
                  }}
                />
                {patientSearchTerm && (!selectedPatient || selectedPatient.name !== patientSearchTerm) && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1px solid #7c3aed', borderRadius: 10,
                    zIndex: 100, maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}>
                    {patients.filter(p =>
                      p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                      (p.village && p.village.toLowerCase().includes(patientSearchTerm.toLowerCase())) ||
                      (p.phone && p.phone.includes(patientSearchTerm))
                    ).map(p => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setSelectedPatientId(p._id);
                          setPatientSearchTerm(p.name);
                        }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                          fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#1e293b' }}>{p.name}</strong>
                          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>{p.age} Yrs ({p.gender})</span>
                        </div>
                        <span style={{ fontSize: 11, background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                          {p.village}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPatient ? (
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Selected: {selectedPatient.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{selectedPatient.age} Yrs · {selectedPatient.gender} · {selectedPatient.village}</div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0', fontSize: 11, color: '#94a3b8' }}>
                  Type to select a patient...
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>Patient Symptoms *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Describe patient symptoms..."
                  value={symptomsInput}
                  onChange={e => setSymptomsInput(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleGetAiSuggestions}
                disabled={loadingAi}
                className="btn-primary"
                style={{ background: '#7c3aed', gap: 6, justifyContent: 'center', width: '100%', fontSize: 13 }}
              >
                <Sparkles size={14} /> {loadingAi ? 'Analyzing Symptoms...' : 'Get AI Treatment Suggestions'}
              </button>
            </div>
          </div>

          {/* Card 2: AI Clinical Suggestions */}
          {aiSuggestions && (
            <div className="card" style={{ padding: 20, border: '1px solid #ddd6fe', background: '#faf5ff', borderRadius: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#6b21a8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartPulse size={16} color="#9333ea" /> AI Clinical Assessment
              </h3>

              <div style={{ background: 'white', padding: '10px 14px', borderRadius: 10, border: '1px solid #e9d5ff', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#4c1d95' }}>Possible Condition:</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginTop: 2 }}>{aiSuggestions.workingDiagnosis}</div>
              </div>

              {/* Suggested Medicines */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', marginBottom: 6 }}>Suggested Medicines:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {aiSuggestions.recommendedMedicines?.map((m, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.dosage} · {m.frequency} · {m.duration}</div>
                      </div>
                      <button
                        onClick={() => addAiMedicineToRx(m)}
                        style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Plus size={12} /> Add to Rx
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautionary Measures */}
              {aiSuggestions.precautions?.length > 0 && (
                <div style={{ borderTop: '1px solid #e9d5ff', paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', marginBottom: 4 }}>Precautions & Lifestyle:</div>
                  <ul style={{ paddingLeft: 16, fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                    {aiSuggestions.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Prescription Composer & Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card 3: Prescription Composer */}
          <div className="card" style={{ padding: 20, background: 'white', borderRadius: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill size={16} color="#7c3aed" /> Prescription Composer
            </h3>

            {/* Database Inventory Search Bar */}
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Search & Add Medicines from Inventory</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    placeholder="Search medicine name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && !selectedMed && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: 10, zIndex: 50, maxHeight: 180, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                        <div
                          key={m._id}
                          onClick={() => { setSelectedMed(m); setSearchTerm(m.name); }}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                        >
                          <strong>{m.name}</strong>
                          <span style={{ color: m.quantity <= m.lowStockThreshold ? '#dc2626' : '#16a34a' }}>Stock: {m.quantity} {m.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <input className="form-input" placeholder="Dose (e.g. 10 Tabs)" value={dose} onChange={e => setDose(e.target.value)} />
                  <input className="form-input" placeholder="Frequency" value={frequency} onChange={e => setFrequency(e.target.value)} />
                  <input className="form-input" placeholder="Duration" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>

                <button type="button" onClick={addInventoryMedToRx} className="btn-primary" style={{ background: '#7c3aed', padding: '8px 12px', fontSize: 12, width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>
            </div>

            {/* Prescribed Medicines List */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Prescribed Medicines ({prescriptionMedicines.length})</div>
              {prescriptionMedicines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 10, color: '#94a3b8', fontSize: 12, border: '1px dashed #cbd5e1' }}>
                  No medicines added. Use AI suggestions or search inventory above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prescriptionMedicines.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {m.dosage} · {m.frequency} · {m.duration}
                        </div>
                      </div>
                      <button
                        onClick={() => removeMedicine(idx)}
                        style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: 6, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Issue & Save Prescription Button */}
            <button
              onClick={handleIssuePrescription}
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', background: '#16a34a', fontSize: 14, fontWeight: 700 }}
            >
              <Check size={16} /> {submitting ? 'Issuing...' : 'Issue & Save Prescription'}
            </button>
          </div>

          {/* Card 4: Prescription Preview */}
          {issuedRx && (
            <div className="card" style={{ padding: 20, border: '2px solid #16a34a', background: 'white', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>OFFICIAL PRESCRIPTION</h3>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{issuedRx.hospitalName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>{issuedRx.id}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{issuedRx.date}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><strong>Patient:</strong> {issuedRx.patientName} ({issuedRx.patientAge} Yrs / {issuedRx.patientGender})</div>
                <div><strong>Diagnosis:</strong> {issuedRx.diagnosisDescription}</div>
                <div><strong>Issued By:</strong> {issuedRx.doctorName}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>Medicines (Rx):</div>
                <ul style={{ paddingLeft: 16, fontSize: 12 }}>
                  {issuedRx.medicines.map((m, i) => (
                    <li key={i} style={{ marginBottom: 3 }}>
                      <strong>{m.name}</strong> - {m.dosage} ({m.frequency}, {m.duration})
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={handleSendWhatsapp}
                    disabled={sendingWhatsapp}
                    className="btn-primary"
                    style={{ background: '#25d366', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700 }}
                  >
                    📱 {sendingWhatsapp ? 'Sending...' : 'Send to Patient WhatsApp'}
                  </button>
                  {whatsappStatus && (
                    <span style={{ fontSize: 11, color: whatsappStatus.includes('Failed') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                      {whatsappStatus}
                    </span>
                  )}
                </div>
                <button onClick={() => window.print()} className="btn-secondary" style={{ gap: 4, padding: '6px 12px', fontSize: 11 }}>
                  <Printer size={12} /> Print Rx
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
