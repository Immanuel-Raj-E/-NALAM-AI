import { useState, useEffect } from 'react';
import { patientAPI, healthRecordAPI, prescriptionAPI, appointmentAPI, vaccinationAPI, doctorAPI, hospitalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart, User, Activity, Pill, Calendar, Syringe, FileText, Phone,
  LogOut, ShieldAlert, CheckCircle2, Clock, MapPin,
  Stethoscope, Settings, Plus, Check, LayoutDashboard, HeartPulse, UserCheck
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
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Emergency SOS Modal
  const [showSOS, setShowSOS] = useState(false);

  // Book Appointment Form State
  const [bookingForm, setBookingForm] = useState({ doctorName: '', doctorSpecialty: 'General Medicine', hospitalName: 'PHC Mathur', appointmentDate: '', appointmentTime: '10:00 AM', reason: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Medicine Reminders Checklist
  const [takenMeds, setTakenMeds] = useState({});

  // Settings State
  const [settings, setSettings] = useState({ smsAlerts: true, language: 'English', theme: 'Light', emergencyAlerts: true });

  // Fetch initial patient profiles & reference data
  useEffect(() => {
    Promise.all([
      patientAPI.getAll({ limit: 100 }),
      doctorAPI.getAll(),
      hospitalAPI.getAll()
    ]).then(([pRes, dRes, hRes]) => {
      const allPatients = pRes.data.data;
      setPatients(allPatients);
      setDoctors(dRes.data.data || []);
      setHospitals(hRes.data.data || []);

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

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const newAppt = await appointmentAPI.create({
        patient: selectedPatientId,
        doctorName: bookingForm.doctorName || 'Dr. Meena Devi',
        doctorSpecialty: bookingForm.doctorSpecialty,
        hospitalName: bookingForm.hospitalName,
        appointmentDate: bookingForm.appointmentDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        appointmentTime: bookingForm.appointmentTime,
        reason: bookingForm.reason || 'General Consultation',
        status: 'Scheduled'
      });
      setAppointments(prev => [newAppt.data.data, ...prev]);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 4000);
      setBookingForm({ doctorName: '', doctorSpecialty: 'General Medicine', hospitalName: 'PHC Mathur', appointmentDate: '', appointmentTime: '10:00 AM', reason: '' });
    } catch (err) {
      alert('Failed to book appointment');
    }
  };

  const toggleMedTaken = (id) => {
    setTakenMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPatient = patient || {
    name: user?.name || 'Lakshmi Devi',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    village: user?.village || 'Mathur',
    district: user?.district || 'Krishnagiri',
    phone: user?.phone || '9876501001',
    riskLevel: 'Medium',
    medicalConditions: ['Anaemia', 'Pregnancy'],
    allergies: ['Penicillin']
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header style={{
        background: '#0f172a',
        color: 'white', padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>NALAM AI Patient Portal</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Rural Healthcare Services</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowSOS(!showSOS)}
            style={{
              background: '#dc2626', color: 'white', border: 'none', borderRadius: 10,
              padding: '8px 14px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <ShieldAlert size={15} /> Emergency SOS
          </button>

          {/* Profile Navigation Button */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: activeTab === 'profile' ? '#16a34a' : '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
              color: 'white', fontWeight: 600, fontSize: 13
            }}
            title="Go to My Profile"
          >
            <User size={15} color="#4ade80" />
            <span>{currentPatient.name.split(' ')[0]}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid #475569',
              color: '#cbd5e1', padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
              fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Emergency SOS Overlay */}
      {showSOS && (
        <div style={{
          position: 'fixed', top: 68, right: 28, width: 320, background: 'white',
          borderRadius: 14, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          zIndex: 1000, border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} /> Emergency Helpline Numbers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Ambulance Service', num: '108', color: '#dc2626' },
              { label: 'National Emergency', num: '112', color: '#dc2626' },
              { label: 'ASHA Helpline', num: '104', color: '#2563eb' },
              { label: 'Child Helpline', num: '1098', color: '#7c3aed' },
              { label: 'ASHA Worker (Meena)', num: '9876543210', color: '#16a34a' }
            ].map(item => (
              <a
                key={item.num}
                href={`tel:${item.num}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', padding: '10px 14px', borderRadius: 10,
                  textDecoration: 'none', border: '1px solid #e2e8f0'
                }}
              >
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{item.label}</span>
                <strong style={{ color: item.color, fontSize: 14 }}>{item.num}</strong>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: 'calc(100vh - 68px)' }}>
        {/* Left Navigation Sidebar */}
        <aside style={{
          background: '#0f172a',
          color: 'white', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
          borderRight: '1px solid #1e293b'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'book-appointment', label: 'Book Appointment', icon: Calendar },
            { id: 'my-appointments', label: 'My Appointments', icon: Clock },
            { id: 'health-records', label: 'Health Records', icon: HeartPulse },
            { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
            { id: 'reminders', label: 'Medicine Reminders', icon: Pill },
            { id: 'asha', label: 'ASHA Worker', icon: UserCheck },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s ease',
                  background: activeTab === item.id ? '#16a34a' : 'transparent',
                  color: activeTab === item.id ? 'white' : '#94a3b8',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  fontSize: 13
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Assigned ASHA Summary Badge */}
          <div style={{ marginTop: 'auto', background: '#1e293b', borderRadius: 12, padding: 14, border: '1px solid #334155' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Assigned ASHA Worker</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: 'white' }}>Meena Kumari</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Mathur PHC</div>
            <a href="tel:9876543210" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 12, fontWeight: 600, marginTop: 6, textDecoration: 'none' }}>
              <Phone size={12} /> 9876543210
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Header Banner */}
              <div className="card" style={{
                padding: 24, background: '#16a34a',
                color: 'white', borderRadius: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Welcome back, {currentPatient.name}</h2>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                      {currentPatient.age} Yrs · {currentPatient.gender} · Blood Group: <strong>{currentPatient.bloodGroup}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                      {currentPatient.village}, {currentPatient.district}
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 13, padding: '6px 14px', background: 'white', color: '#16a34a', fontWeight: 700 }}>
                    {currentPatient.riskLevel} Risk Profile
                  </span>
                </div>
              </div>

              {/* Vitals Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f0fdf4' }}><Activity size={22} color="#16a34a" /></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800 }}>{records.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Health Visits</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f0f9ff' }}><FileText size={22} color="#0ea5e9" /></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800 }}>{prescriptions.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Prescriptions</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fefce8' }}><Calendar size={22} color="#ca8a04" /></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800 }}>{appointments.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Appointments</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#faf5ff' }}><Syringe size={22} color="#9333ea" /></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800 }}>{vaccinations.filter(v => v.status === 'Completed').length} / {vaccinations.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Vaccines Done</div></div>
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Medical Conditions & Allergies</h3>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Conditions</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentPatient.medicalConditions?.map((c, i) => <span key={i} className="badge badge-blue">{c}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Allergies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentPatient.allergies?.map((a, i) => <span key={i} className="badge badge-red">{a}</span>)}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 20, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#166534', marginBottom: 10 }}>Personal Health Advice</h3>
                  <div style={{ fontSize: 13, color: '#14532d', lineHeight: 1.7 }}>
                    <p>• Take Iron Folic Acid tablet daily after dinner with citrus fruit juice.</p>
                    <p>• Drink at least 3 Litres of clean water daily.</p>
                    <p>• Contact ASHA Worker Meena Kumari (9876543210) for assistance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOK APPOINTMENT TAB */}
          {activeTab === 'book-appointment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Book Doctor Appointment</h2>
                <p style={{ fontSize: 13, color: '#64748b' }}>Schedule a consultation at your nearest PHC or hospital</p>
              </div>

              {bookingSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                  Appointment booked successfully! Your clinic has been notified.
                </div>
              )}

              <div className="card" style={{ padding: 24, maxWidth: 600 }}>
                <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Hospital / PHC</label>
                    <select
                      className="form-select"
                      value={bookingForm.hospitalName}
                      onChange={e => setBookingForm({ ...bookingForm, hospitalName: e.target.value })}
                    >
                      <option value="PHC Mathur">PHC Mathur (Primary Health Centre)</option>
                      <option value="Krishnagiri Government Hospital">Krishnagiri Government Hospital</option>
                      <option value="Salem Government Hospital">Salem Government Hospital</option>
                      <option value="Bargur CHC">Bargur Community Health Centre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Doctor / Specialty</label>
                    <select
                      className="form-select"
                      value={bookingForm.doctorName}
                      onChange={e => setBookingForm({ ...bookingForm, doctorName: e.target.value })}
                    >
                      <option value="">Choose Doctor (Or Medical Officer)</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={bookingForm.appointmentDate}
                        onChange={e => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time Slot</label>
                      <select
                        className="form-select"
                        value={bookingForm.appointmentTime}
                        onChange={e => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                      >
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="2:00 PM">2:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Visit</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Describe symptoms or reason for visit..."
                      value={bookingForm.reason}
                      onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '12px', justifyContent: 'center', fontSize: 14 }}>
                    <Calendar size={16} /> Confirm Appointment
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. MY APPOINTMENTS TAB */}
          {activeTab === 'my-appointments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>My Booked Appointments</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Doctor</th><th>Hospital</th><th>Date & Time</th><th>Reason</th><th>Status</th></tr></thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No appointments booked yet.</td></tr>
                      ) : (
                        appointments.map(a => (
                          <tr key={a._id}>
                            <td><strong>{a.doctorName}</strong> ({a.doctorSpecialty})</td>
                            <td>{a.hospitalName}</td>
                            <td>{new Date(a.appointmentDate).toLocaleDateString('en-IN')} · {a.appointmentTime}</td>
                            <td>{a.reason}</td>
                            <td><span className={`badge ${a.status === 'Completed' ? 'badge-green' : 'badge-blue'}`}>{a.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. HEALTH RECORDS TAB */}
          {activeTab === 'health-records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Health Visit Records</h2>
              {records.length === 0 ? (
                <div className="card" style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No visit records found.</div>
              ) : (
                records.map(r => (
                  <div key={r._id} className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{r.chiefComplaint || 'Health Checkup Visit'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Visited on {new Date(r.visitDate).toLocaleDateString('en-IN')}</div>
                    {r.diagnosis && <div style={{ fontSize: 13, color: '#166534', background: '#f0fdf4', padding: 10, borderRadius: 8, marginBottom: 6 }}><strong>Diagnosis:</strong> {r.diagnosis}</div>}
                    {r.doctorNotes && <div style={{ fontSize: 13, color: '#475569' }}><strong>Doctor Notes:</strong> {r.doctorNotes}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Digital Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <div className="card" style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No prescriptions found.</div>
              ) : (
                prescriptions.map(p => (
                  <div key={p._id} className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>Doctor: {p.doctorName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.hospitalName} · Date: {new Date(p.prescriptionDate).toLocaleDateString('en-IN')}</div>
                    {p.notes && <div style={{ fontSize: 13, color: '#374151', background: '#f8fafc', padding: 12, borderRadius: 10, marginTop: 10 }}>{p.notes}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. MEDICINE REMINDERS TAB */}
          {activeTab === 'reminders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Daily Medicine Reminders</h2>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 14 }}>Today's Prescribed Dose Checklist</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { id: 'm1', name: 'Iron Folic Acid (IFA) 100mg', dose: '1 Tablet after Dinner', time: '8:00 PM' },
                    { id: 'm2', name: 'Calcium Supplement 500mg', dose: '1 Tablet after Breakfast', time: '9:00 AM' },
                    { id: 'm3', name: 'Paracetamol 500mg', dose: '1 Tablet if fever occurs', time: 'SOS' }
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMedTaken(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                        border: '1px solid', borderColor: takenMeds[m.id] ? '#16a34a' : '#e2e8f0',
                        background: takenMeds[m.id] ? '#f0fdf4' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, border: '2px solid',
                          borderColor: takenMeds[m.id] ? '#16a34a' : '#cbd5e1',
                          background: takenMeds[m.id] ? '#16a34a' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                          {takenMeds[m.id] && <Check size={14} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, textDecoration: takenMeds[m.id] ? 'line-through' : 'none', color: takenMeds[m.id] ? '#166534' : '#1e293b' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{m.dose} · {m.time}</div>
                        </div>
                      </div>
                      <span className={`badge ${takenMeds[m.id] ? 'badge-green' : 'badge-yellow'}`}>
                        {takenMeds[m.id] ? 'Taken' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ASHA WORKER TAB */}
          {activeTab === 'asha' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Assigned ASHA Worker</h2>
              <div className="card" style={{ padding: 24, maxWidth: 500 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                    M
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meena Kumari</h3>
                    <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>ASHA Worker</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Mathur Village PHC</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: '#475569' }}><strong>Phone:</strong> +91 9876543210</div>
                  <div style={{ fontSize: 13, color: '#475569' }}><strong>Center:</strong> Primary Health Centre Mathur</div>
                </div>

                <a
                  href="tel:9876543210"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#16a34a', color: 'white',
                    borderRadius: 10, padding: '10px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 700
                  }}
                >
                  <Phone size={15} /> Call ASHA Worker
                </a>
              </div>
            </div>
          )}

          {/* 8. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>My Patient Profile</h2>
              <div className="card" style={{ padding: 24, maxWidth: 500 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                    {currentPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{currentPatient.name}</h3>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Patient Profile</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>AGE / GENDER</div><div style={{ fontSize: 14, fontWeight: 600 }}>{currentPatient.age} Yrs · {currentPatient.gender}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>BLOOD GROUP</div><div style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>{currentPatient.bloodGroup}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>PHONE</div><div style={{ fontSize: 14, fontWeight: 600 }}>{currentPatient.phone}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>VILLAGE</div><div style={{ fontSize: 14, fontWeight: 600 }}>{currentPatient.village}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 9. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Settings & Preferences</h2>
              <div className="card" style={{ padding: 24, maxWidth: 500 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>SMS Medicine Reminders</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Receive daily dose alerts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsAlerts}
                      onChange={e => setSettings({ ...settings, smsAlerts: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Language</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Portal display language</div>
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 120 }}
                      value={settings.language}
                      onChange={e => setSettings({ ...settings, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
