import { useState, useEffect } from 'react';
import { patientAPI, medicineAPI, prescriptionAPI, aiAPI } from '../services/api';
import { Pill, Search, Plus, Trash2, Printer, FileText, Check, AlertCircle, Sparkles, User, HeartPulse, ShieldCheck } from 'lucide-react';

export default function PrescriptionGeneratorPage() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Minimal patient & symptom input state
  const [symptomsInput, setSymptomsInput] = useState('');
  const [diagnosisDescription, setDiagnosisDescription] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Meena Devi');
  const [hospitalName, setHospitalName] = useState('Mathur Primary Health Centre');

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

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill size={24} color="#7c3aed" /> ASHA Digital Prescription Generator
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Enter minimal patient details & symptoms to get instant AI treatment suggestions (Medical Report Analysis model) and issue prescriptions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* STEP 1: MINIMAL PATIENT & SYMPTOMS SELECTION */}
        <div className="card" style={{ padding: 20, border: '1fr solid #e2e8f0', background: 'white' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="#7c3aed" /> Step 1: Select Patient & Symptoms
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} · {p.age} Yrs ({p.gender}) - {p.village}</option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{selectedPatient.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Age: {selectedPatient.age} Yrs | Gender: {selectedPatient.gender} | Village: {selectedPatient.village}</div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Type Patient Symptoms (Plain Text) *</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. High fever, severe headache, running nose, body pain, cough..."
              value={symptomsInput}
              onChange={e => setSymptomsInput(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleGetAiSuggestions}
            disabled={loadingAi}
            className="btn-primary"
            style={{ background: '#7c3aed', gap: 8 }}
          >
            <Sparkles size={16} /> {loadingAi ? 'Analyzing Symptoms...' : 'Get AI Treatment Suggestions'}
          </button>
        </div>

        {/* STEP 2: AI CLINICAL SUGGESTIONS (Integrated from Medical Report Analysis) */}
        {aiSuggestions && (
          <div className="card" style={{ padding: 20, border: '1px solid #a78bfa', background: '#faf5ff' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#6b21a8', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartPulse size={18} color="#9333ea" /> AI Clinical Assessment (Medical Report Analysis Engine)
            </h3>

            <div style={{ background: 'white', padding: 14, borderRadius: 8, border: '1px solid #e9d5ff', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                Possible Condition / Working Diagnosis: <span style={{ color: '#7c3aed' }}>{aiSuggestions.workingDiagnosis}</span>
              </div>
            </div>

            {/* Suggested Medicines */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 8 }}>Suggested Medicines (Click '+ Add to Rx' to add):</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {aiSuggestions.recommendedMedicines?.map((m, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Dose: {m.dosage} | Frequency: {m.frequency} | Duration: {m.duration}</div>
                    </div>
                    <button
                      onClick={() => addAiMedicineToRx(m)}
                      style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Plus size={14} /> Add to Rx
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Precautionary Measures */}
            {aiSuggestions.precautions?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 6 }}>Precautionary & Lifestyle Measures:</div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                  {aiSuggestions.precautions.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: INVENTORY MEDICINE SELECTOR & FINAL PRESCRIPTION TABLE */}
        <div className="card" style={{ padding: 20, border: '1px solid #e2e8f0', background: 'white' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={18} color="#7c3aed" /> Step 2: Add Medicines & Complete Prescription
          </h3>

          {/* Database Inventory Search Bar */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Search & Select Medicine from Database Inventory</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 120px auto', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  placeholder="Search medicine name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && !selectedMed && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, zIndex: 50, maxHeight: 180, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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

              <input className="form-input" placeholder="Dose (e.g. 10 Tablets)" value={dose} onChange={e => setDose(e.target.value)} />
              <input className="form-input" placeholder="Frequency" value={frequency} onChange={e => setFrequency(e.target.value)} />
              <input className="form-input" placeholder="Duration" value={duration} onChange={e => setDuration(e.target.value)} />

              <button type="button" onClick={addInventoryMedToRx} className="btn-primary" style={{ background: '#7c3aed' }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* Active Prescription Items Table */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Prescribed Medicines ({prescriptionMedicines.length})</h4>
            {prescriptionMedicines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, background: '#f8fafc', borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
                No medicines added yet. Use AI suggestions or search inventory above to add medicines.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Medicine</th><th>Quantity / Dosage</th><th>Frequency</th><th>Duration</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {prescriptionMedicines.map((m, idx) => (
                      <tr key={idx}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                        <td>
                          <button onClick={() => removeMedicine(idx)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Issue & Save Prescription Button */}
          <button
            onClick={handleIssuePrescription}
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', background: '#16a34a', fontSize: 15, fontWeight: 700 }}
          >
            <Check size={18} /> {submitting ? 'Saving Prescription & Updating Stock...' : 'Issue & Save Digital Prescription'}
          </button>
        </div>

        {/* ISSUED PRESCRIPTION PREVIEW CARD */}
        {issuedRx && (
          <div className="card" style={{ padding: 24, border: '2px solid #16a34a', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>OFFICIAL MOCK PRESCRIPTION</h3>
                <div style={{ fontSize: 12, color: '#64748b' }}>{issuedRx.hospitalName} · Issued by {issuedRx.doctorName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{issuedRx.id}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Date: {issuedRx.date}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div><strong>Patient:</strong> {issuedRx.patientName}</div>
              <div><strong>Age / Gender:</strong> {issuedRx.patientAge} Yrs / {issuedRx.patientGender}</div>
              <div><strong>Diagnosis:</strong> {issuedRx.diagnosisDescription}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Prescribed Medicines (Rx):</div>
              <ul>
                {issuedRx.medicines.map((m, i) => (
                  <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>
                    <strong>{m.name}</strong> - {m.dosage} ({m.frequency}, {m.duration})
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✅ Prescription saved to database. Inventory stock updated automatically.</span>
              <button onClick={() => window.print()} className="btn-secondary" style={{ gap: 6 }}>
                <Printer size={14} /> Print Rx
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
