import { useState, useEffect } from 'react';
import { patientAPI, healthRecordAPI, prescriptionAPI, appointmentAPI, vaccinationAPI, doctorAPI, hospitalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart, User, Activity, Pill, Calendar, Syringe, FileText, Phone,
  LogOut, Bot, Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Sparkles, MapPin,
  Stethoscope, Settings, Bell, ChevronRight, Plus, Check, Search, Building2
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
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | book-appointment | my-appointments | health-records | prescriptions | reminders | asha | profile | settings

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

  // Fallback patient object if database lookup returns empty
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
      {/* Top Header Bar with Profile Button & Emergency SOS at corner */}
      <header style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c25 100%)',
        color: 'white', padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={22} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.5px' }}>NALAM AI · Patient Portal</div>
            <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Rural Primary Healthcare Services</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Emergency SOS Corner Button */}
          <button
            onClick={() => setShowSOS(!showSOS)}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '9px 16px', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
              animation: 'pulse-soft 2s infinite'
            }}
          >
            <Phone size={15} /> 🚨 Emergency SOS
          </button>

          {/* Profile Navigation Button (Present on Header of Every Page) */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: activeTab === 'profile' ? '#16a34a' : 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '6px 14px', cursor: 'pointer',
              color: 'white', fontWeight: 700, fontSize: 13,
              transition: 'all 0.2s ease'
            }}
            title="Go to My Profile"
          >
            <User size={16} color="#4ade80" />
            <span>{currentPatient.name.split(' ')[0]} (Profile)</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Emergency SOS Overlay Panel */}
      {showSOS && (
        <div style={{
          position: 'fixed', top: 70, right: 28, width: 320, background: 'white',
          borderRadius: 20, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          zIndex: 1000, border: '2px solid #fecaca', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚨 Direct Emergency Escalation
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            Click any number to immediately place an emergency call:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '🚑 Free Medical Ambulance', num: '108', color: '#ef4444' },
              { label: '📞 National Emergency Response', num: '112', color: '#dc2626' },
              { label: '👩‍⚕️ ASHA Health Line', num: '104', color: '#2563eb' },
              { label: '👶 Child Emergency Helpline', num: '1098', color: '#7c3aed' },
              { label: '📞 Assigned ASHA (Meena Kumari)', num: '9876543210', color: '#16a34a' }
            ].map(item => (
              <a
                key={item.num}
                href={`tel:${item.num}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff5f5', padding: '10px 14px', borderRadius: 12,
                  textDecoration: 'none', border: '1px solid #fee2e2'
                }}
              >
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{item.label}</span>
                <strong style={{ color: item.color, fontSize: 15 }}>{item.num}</strong>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: 'calc(100vh - 68px)' }}>
        {/* Left Navigation Sidebar */}
        <aside style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: 'white', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', padding: '0 12px 10px', letterSpacing: '0.05em' }}>
            Patient Portal Menu
          </div>

          {[
            { id: 'dashboard', label: '🏠 Dashboard', desc: 'Overview & vitals' },
            { id: 'book-appointment', label: '📅 Book Appointment', desc: 'Doctor & hospital visits' },
            { id: 'my-appointments', label: '📋 My Appointments', desc: 'Scheduled consultations' },
            { id: 'health-records', label: '❤️ Health Records', desc: 'Visits & diagnoses' },
            { id: 'prescriptions', label: '💊 Prescriptions', desc: 'Digital Doctor Rx' },
            { id: 'reminders', label: '⏰ Medicine Reminders', desc: 'Daily intake schedule' },
            { id: 'asha', label: '👨‍⚕️ ASHA Worker', desc: 'Assigned Healthcare Worker' },
            { id: 'profile', label: '👤 Profile', desc: 'Personal details' },
            { id: 'settings', label: '⚙️ Settings', desc: 'Preferences & alerts' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.2s ease',
                background: activeTab === item.id ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.35) 0%, rgba(22, 163, 74, 0.15) 100%)' : 'transparent',
                color: activeTab === item.id ? '#4ade80' : '#cbd5e1',
                boxShadow: activeTab === item.id ? 'inset 0 0 0 1px rgba(74, 222, 128, 0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{item.desc}</div>
            </button>
          ))}

          {/* Assigned ASHA Summary Badge */}
          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 800, textTransform: 'uppercase' }}>Assigned ASHA Worker</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4, color: 'white' }}>Meena Kumari</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>📍 Mathur PHC</div>
            <a href="tel:9876543210" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 12, fontWeight: 700, marginTop: 8, textDecoration: 'none' }}>
              <Phone size={12} /> Call ASHA Worker
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
                padding: 28, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: 'white', borderRadius: 24, boxShadow: '0 8px 30px rgba(22,163,74,0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 22, background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, fontWeight: 900, color: '#16a34a'
                    }}>
                      {currentPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Welcome back, {currentPatient.name}!</h2>
                      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                        {currentPatient.age} Yrs · {currentPatient.gender} · Blood Group: <strong>{currentPatient.bloodGroup}</strong>
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
                        📍 {currentPatient.village}, {currentPatient.district}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <span className="badge badge-green" style={{ fontSize: 13, padding: '8px 16px', background: 'white', color: '#16a34a', fontWeight: 800 }}>
                      {currentPatient.riskLevel} Risk Profile
                    </span>
                  </div>
                </div>
              </div>

              {/* Vitals & Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#dcfce7' }}><Activity size={24} color="#16a34a" /></div>
                  <div><div style={{ fontSize: 26, fontWeight: 800 }}>{records.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Health Visits</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e0f2fe' }}><Pill size={24} color="#0ea5e9" /></div>
                  <div><div style={{ fontSize: 26, fontWeight: 800 }}>{prescriptions.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Active Prescriptions</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef9c3' }}><Calendar size={24} color="#ca8a04" /></div>
                  <div><div style={{ fontSize: 26, fontWeight: 800 }}>{appointments.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Scheduled Visits</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f3e8ff' }}><Syringe size={24} color="#9333ea" /></div>
                  <div><div style={{ fontSize: 26, fontWeight: 800 }}>{vaccinations.filter(v => v.status === 'Completed').length} / {vaccinations.length}</div><div style={{ fontSize: 13, color: '#64748b' }}>Vaccines Done</div></div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 14 }}>Known Conditions & Allergies</h3>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Medical Conditions</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentPatient.medicalConditions?.map((c, i) => <span key={i} className="badge badge-blue" style={{ fontSize: 13 }}>{c}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Allergies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentPatient.allergies?.map((a, i) => <span key={i} className="badge badge-red" style={{ fontSize: 13 }}>{a}</span>)}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} /> Personalized Health Advice
                  </h3>
                  <div style={{ fontSize: 13, color: '#14532d', lineHeight: 1.8 }}>
                    <p>• Take prescribed Iron Folic Acid tablet daily after dinner with lemon juice.</p>
                    <p>• Drink at least 3 Litres of clean boiled water daily.</p>
                    <p>• Next ANC health visit at Mathur PHC with ASHA Worker <strong>Meena Kumari</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOK APPOINTMENT TAB */}
          {activeTab === 'book-appointment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Book Doctor & Hospital Appointment</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Schedule a visit with PHC doctors or government hospital specialists</p>
                </div>
              </div>

              {bookingSuccess && (
                <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: 16, borderRadius: 16, fontWeight: 700 }}>
                  🎉 Appointment booked successfully! Your ASHA Worker and PHC clinic have been notified.
                </div>
              )}

              <div className="card" style={{ padding: 28, maxWidth: 640 }}>
                <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Hospital / PHC Center</label>
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
                      <option value="">Choose Doctor (Or any available Medical Officer)</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.specialty}) · {d.hospital}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Preferred Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={bookingForm.appointmentDate}
                        onChange={e => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Time Slot</label>
                      <select
                        className="form-select"
                        value={bookingForm.appointmentTime}
                        onChange={e => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                      >
                        <option value="9:00 AM">9:00 AM (Morning)</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="2:00 PM">2:00 PM (Afternoon)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Visit / Health Symptoms</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="e.g. Regular ANC checkup, fever, blood pressure review..."
                      value={bookingForm.reason}
                      onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '13px', justifyContent: 'center', fontSize: 15, marginTop: 8 }}>
                    <Calendar size={18} /> Confirm Appointment Booking
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. MY APPOINTMENTS TAB */}
          {activeTab === 'my-appointments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>My Booked Appointments</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Doctor</th><th>Hospital</th><th>Date & Time</th><th>Reason</th><th>Status</th></tr></thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No appointments booked yet.</td></tr>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Clinical Health Records & Diagnoses</h2>
              {records.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No visit records found.</div>
              ) : (
                records.map(r => (
                  <div key={r._id} className="card" style={{ padding: 24, borderLeft: '4px solid #16a34a' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{r.chiefComplaint || 'Health Checkup Visit'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Visited on {new Date(r.visitDate).toLocaleDateString('en-IN')} · Conducted by ASHA Worker Meena Kumari</div>
                    {r.diagnosis && <div style={{ fontSize: 14, color: '#166534', background: '#f0fdf4', padding: 12, borderRadius: 10, marginBottom: 8 }}><strong>Diagnosis:</strong> {r.diagnosis}</div>}
                    {r.doctorNotes && <div style={{ fontSize: 13, color: '#475569' }}><strong>Doctor Notes:</strong> {r.doctorNotes}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Digital Prescriptions (Doctor & AI Rx)</h2>
              {prescriptions.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No prescriptions available.</div>
              ) : (
                prescriptions.map(p => (
                  <div key={p._id} className="card" style={{ padding: 24, borderLeft: '4px solid #0ea5e9' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0ea5e9' }}>Doctor: {p.doctorName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.hospitalName} · Date: {new Date(p.prescriptionDate).toLocaleDateString('en-IN')}</div>
                    {p.notes && <div style={{ fontSize: 14, color: '#374151', background: '#f8fafc', padding: 14, borderRadius: 12, marginTop: 12 }}>{p.notes}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. MEDICINE REMINDERS TAB */}
          {activeTab === 'reminders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Daily Medicine Intake Schedule</h2>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', marginBottom: 16 }}>Today's Prescribed Dose Checklist</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'm1', name: 'Iron Folic Acid (IFA) 100mg', dose: '1 Tablet after Dinner', time: '8:00 PM', freq: 'Daily' },
                    { id: 'm2', name: 'Calcium Supplement 500mg', dose: '1 Tablet after Breakfast', time: '9:00 AM', freq: 'Daily' },
                    { id: 'm3', name: 'Paracetamol 500mg', dose: '1 Tablet if fever > 100°F', time: 'As needed', freq: 'SOS' }
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMedTaken(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                        border: '1.5px solid', borderColor: takenMeds[m.id] ? '#16a34a' : '#e2e8f0',
                        background: takenMeds[m.id] ? '#dcfce7' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 8, border: '2px solid',
                          borderColor: takenMeds[m.id] ? '#16a34a' : '#cbd5e1',
                          background: takenMeds[m.id] ? '#16a34a' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                          {takenMeds[m.id] && <Check size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, textDecoration: takenMeds[m.id] ? 'line-through' : 'none', color: takenMeds[m.id] ? '#166534' : '#1e293b' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{m.dose} · {m.time}</div>
                        </div>
                      </div>
                      <span className={`badge ${takenMeds[m.id] ? 'badge-green' : 'badge-yellow'}`}>
                        {takenMeds[m.id] ? 'Taken Today' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ASHA WORKER TAB */}
          {activeTab === 'asha' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Assigned ASHA Worker Assistance</h2>
              <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', borderRadius: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>
                    M
                  </div>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Meena Kumari</h3>
                    <div style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>Accredited Social Health Activist (ASHA)</div>
                    <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 2 }}>📍 Primary Health Centre Mathur · Krishnagiri Block</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: 14, borderRadius: 14 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Contact Phone</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>+91 9876543210</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: 14, borderRadius: 14 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Assigned Village</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Mathur Village</div>
                  </div>
                </div>

                <a
                  href="tel:9876543210"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                    borderRadius: 12, padding: '12px 24px', textDecoration: 'none', fontSize: 14, fontWeight: 800
                  }}
                >
                  <Phone size={16} /> Call ASHA Worker Now
                </a>
              </div>
            </div>
          )}

          {/* 8. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>My Patient Profile</h2>
              <div className="card" style={{ padding: 28, maxWidth: 600 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white' }}>
                    {currentPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{currentPatient.name}</h3>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Patient Account ID: #{selectedPatientId || '1001'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>AGE / GENDER</div><div style={{ fontSize: 15, fontWeight: 700 }}>{currentPatient.age} Yrs · {currentPatient.gender}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>BLOOD GROUP</div><div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{currentPatient.bloodGroup}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>PHONE</div><div style={{ fontSize: 15, fontWeight: 700 }}>{currentPatient.phone}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>VILLAGE</div><div style={{ fontSize: 15, fontWeight: 700 }}>{currentPatient.village}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 9. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Portal Settings & Preferences</h2>
              <div className="card" style={{ padding: 28, maxWidth: 600 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>SMS & WhatsApp Medicine Alerts</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Receive daily medicine reminder SMS</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsAlerts}
                      onChange={e => setSettings({ ...settings, smsAlerts: e.target.checked })}
                      style={{ width: 20, height: 20, cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Language</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Select interface language</div>
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 140 }}
                      value={settings.language}
                      onChange={e => setSettings({ ...settings, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
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
