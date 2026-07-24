import { useState, useEffect } from 'react';
import { patientAPI, medicineAPI, prescriptionAPI } from '../services/api';
import { Pill, Search, Plus, Trash2, Printer, FileText, Check, AlertCircle } from 'lucide-react';

export default function PrescriptionGeneratorPage() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosisDescription, setDiagnosisDescription] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Meena Devi');
  const [hospitalName, setHospitalName] = useState('Mathur Primary Health Centre');

  // Search & add medicine state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [dose, setDose] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('5 days');
  const [instructions, setInstructions] = useState('After meals');

  // Prescription items list
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [issuedRx, setIssuedRx] = useState(null);

  useEffect(() => {
    Promise.all([
      patientAPI.getAll({ limit: 200 }),
      medicineAPI.getAll({ limit: 200 }),
    ]).then(([pRes, mRes]) => {
      setPatients(pRes.data.data || []);
      setMedicines(mRes.data.data || []);
    });
  }, []);

  const addMedicineToRx = () => {
    if (!selectedMed) {
      alert('Please select a medicine from the inventory search bar.');
      return;
    }
    const newItem = {
      medicineId: selectedMed._id,
      name: selectedMed.name,
      dosage: dose,
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
    if (!diagnosisDescription.trim()) {
      alert('Please enter a description about the disease/diagnosis.');
      return;
    }
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine from inventory.');
      return;
    }

    try {
      const patient = patients.find(p => p._id === selectedPatientId);
      const rxNotes = `Diagnosis: ${diagnosisDescription}. Medicines: ${prescriptionMedicines.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ')}`;

      const res = await prescriptionAPI.create({
        patient: selectedPatientId,
        doctorName,
        hospitalName,
        prescriptionDate: new Date(),
        notes: rxNotes,
        extractedMedicines: prescriptionMedicines,
        ocrText: JSON.stringify({ diagnosisDescription, prescriptionMedicines }, null, 2),
      });

      setIssuedRx({
        id: res.data.data._id || `RX-${Date.now()}`,
        patientName: patient?.name,
        patientAge: patient?.age,
        patientGender: patient?.gender,
        diagnosisDescription,
        doctorName,
        hospitalName,
        medicines: prescriptionMedicines,
        date: new Date().toLocaleDateString('en-IN')
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);

      // Reset form
      setDiagnosisDescription('');
      setPrescriptionMedicines([]);
    } catch (err) {
      alert('Failed to save prescription');
    }
  };

  const filteredMedicines = searchTerm.trim()
    ? medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.genericName?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Prescription Generator</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Describe patient disease diagnosis and select medicines from inventory</p>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
          {/* Left Form Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {savedSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: 14, borderRadius: 10, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={18} /> Prescription generated and saved to patient record!
              </div>
            )}

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>1. Select Patient & Disease Description</h3>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Select Patient</label>
                <select
                  className="form-select"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.age} Yrs, {p.gender}) · {p.village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Disease Description & Clinical Diagnosis</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Describe patient's disease, symptoms, and diagnosis (e.g. Acute upper respiratory infection with mild fever...)"
                  value={diagnosisDescription}
                  onChange={e => setDiagnosisDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Prescribing Doctor</label>
                  <input className="form-input" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital / PHC</label>
                  <input className="form-input" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Medicine Inventory Search & Selection Card */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={18} color="#16a34a" /> 2. Search & Add Medicines from Inventory
              </h3>

              {/* Medicine Search Bar */}
              <div className="form-group" style={{ position: 'relative', marginBottom: 14 }}>
                <label className="form-label">Search Medicine Inventory (Database)</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Type medicine name (e.g. Paracetamol, Amoxicillin)..."
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setSelectedMed(null);
                    }}
                  />
                </div>

                {/* Dropdown Results */}
                {searchTerm.trim() && !selectedMed && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                    borderRadius: 10, border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: 200, overflowY: 'auto', zIndex: 50, marginTop: 4
                  }}>
                    {filteredMedicines.length === 0 ? (
                      <div style={{ padding: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>No matching medicines in inventory</div>
                    ) : (
                      filteredMedicines.map(m => (
                        <div
                          key={m._id}
                          onClick={() => {
                            setSelectedMed(m);
                            setSearchTerm(m.name);
                          }}
                          style={{
                            padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 13, color: '#1e293b' }}>{m.name}</strong>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{m.genericName} · {m.category}</div>
                          </div>
                          <span className={`badge ${m.quantity > m.lowStockThreshold ? 'badge-green' : 'badge-red'}`}>
                            {m.quantity} in stock
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Medicine Parameters */}
              {selectedMed && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>
                    Selected: {selectedMed.name} ({selectedMed.genericName})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Dose</label>
                      <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} value={dose} onChange={e => setDose(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Frequency</label>
                      <select className="form-select" style={{ padding: '6px 10px', fontSize: 12 }} value={frequency} onChange={e => setFrequency(e.target.value)}>
                        <option value="Once daily">Once daily (OD)</option>
                        <option value="Twice daily">Twice daily (BD)</option>
                        <option value="Thrice daily">Thrice daily (TDS)</option>
                        <option value="SOS">SOS (As needed)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Duration</label>
                      <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} value={duration} onChange={e => setDuration(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Timing</label>
                      <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} value={instructions} onChange={e => setInstructions(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={addMedicineToRx} className="btn-primary" style={{ marginTop: 12, padding: '8px 14px', fontSize: 13 }}>
                    <Plus size={14} /> Add Medicine to Prescription
                  </button>
                </div>
              )}

              {/* Added Medicines List */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Prescription Medicines ({prescriptionMedicines.length})</div>
                {prescriptionMedicines.length === 0 ? (
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                    No medicines added yet. Use the search bar above to select medicines from inventory.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {prescriptionMedicines.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong style={{ fontSize: 13, color: '#16a34a' }}>{m.name}</strong>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{m.dosage} · {m.frequency} · {m.duration} ({m.instructions})</div>
                        </div>
                        <button onClick={() => removeMedicine(idx)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleIssuePrescription}
                className="btn-primary"
                style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
              >
                <FileText size={16} /> Issue & Save Prescription
              </button>
            </div>
          </div>

          {/* Right Column: Issued Prescription Preview Card */}
          <div>
            <div className="card" style={{ padding: 24, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #16a34a', paddingBottom: 12, marginBottom: 14 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', margin: 0 }}>NALAM HEALTHCARE RX</h4>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Primary Health Centre</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                  Date: {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>

              {issuedRx ? (
                <div>
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Patient: {issuedRx.patientName} ({issuedRx.patientAge}y, {issuedRx.patientGender})</div>
                    <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}><strong>Diagnosis:</strong> {issuedRx.diagnosisDescription}</div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Medicines</div>
                    {issuedRx.medicines.map((m, i) => (
                      <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                        <strong style={{ color: '#1e293b' }}>{m.name}</strong> - {m.dosage} ({m.frequency}) x {m.duration}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
                    Prescribed by {issuedRx.doctorName} · {issuedRx.hospitalName}
                  </div>

                  <button onClick={() => window.print()} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Printer size={14} /> Print Rx Document
                  </button>
                </div>
              ) : (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  Complete the form and click "Issue & Save Prescription" to view the printable Rx document here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
