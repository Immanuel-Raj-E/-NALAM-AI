import { useState, useEffect } from 'react';
import { hospitalAPI, patientAPI, medicineAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, Pill, UserCheck, Shield, Plus, Trash2, LogOut, Search,
  CheckCircle2, AlertTriangle, Phone, MapPin, Edit, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('hospitals'); // hospitals | asha-workers | medicines | patients

  // State collections
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [ashaWorkers, setAshaWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modals
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [hospitalForm, setHospitalForm] = useState({ name: '', location: '', block: 'Krishnagiri Block', district: 'Krishnagiri', phone: '', doctorCount: 3 });

  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [medicineForm, setMedicineForm] = useState({ name: '', genericName: '', category: 'Analgesic', quantity: 100, lowStockThreshold: 20 });

  const [showAddAsha, setShowAddAsha] = useState(false);
  const [ashaForm, setAshaForm] = useState({ name: '', email: '', password: 'asha1234', phone: '', village: 'Mathur', district: 'Krishnagiri' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [hRes, pRes, mRes] = await Promise.all([
        hospitalAPI.getAll(),
        patientAPI.getAll({ limit: 200 }),
        medicineAPI.getAll({ limit: 200 }),
      ]);
      setHospitals(hRes.data.data || []);
      setPatients(pRes.data.data || []);
      setMedicines(mRes.data.data || []);

      // Mock or fetch ASHA workers list
      setAshaWorkers([
        { _id: '1', name: 'Meena Kumari', email: 'meena@nalamhealth.in', phone: '9876543210', village: 'Mathur', district: 'Krishnagiri', patientCount: 10 },
        { _id: '2', name: 'Anitha Ramesh', email: 'anitha@nalamhealth.in', phone: '9876543211', village: 'Veppanapalli', district: 'Krishnagiri', patientCount: 8 },
        { _id: '3', name: 'Kavya Senthil', email: 'kavya@nalamhealth.in', phone: '9876543212', village: 'Bargur', district: 'Krishnagiri', patientCount: 6 },
      ]);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add Hospital
  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalAPI.create(hospitalForm);
      setHospitals(prev => [res.data.data, ...prev]);
      setShowAddHospital(false);
      setHospitalForm({ name: '', location: '', block: 'Krishnagiri Block', district: 'Krishnagiri', phone: '', doctorCount: 3 });
    } catch (err) {
      alert('Failed to add hospital');
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id) => {
    if (!window.confirm('Delete this hospital?')) return;
    try {
      await hospitalAPI.delete(id);
      setHospitals(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      alert('Failed to delete hospital');
    }
  };

  // Add Medicine
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await medicineAPI.create({ ...medicineForm, unit: 'Tablets', expiryDate: new Date('2026-12-31') });
      setMedicines(prev => [res.data.data, ...prev]);
      setShowAddMedicine(false);
      setMedicineForm({ name: '', genericName: '', category: 'Analgesic', quantity: 100, lowStockThreshold: 20 });
    } catch (err) {
      alert('Failed to add medicine');
    }
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Delete this medicine from inventory?')) return;
    try {
      await medicineAPI.delete(id);
      setMedicines(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert('Failed to delete medicine');
    }
  };

  // Add ASHA Worker
  const handleAddAsha = (e) => {
    e.preventDefault();
    const newWorker = { _id: Date.now().toString(), ...ashaForm, patientCount: 0 };
    setAshaWorkers(prev => [newWorker, ...prev]);
    setShowAddAsha(false);
    setAshaForm({ name: '', email: '', password: 'asha1234', phone: '', village: 'Mathur', district: 'Krishnagiri' });
  };

  // Delete Patient
  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete patient record?')) return;
    try {
      await patientAPI.delete(id);
      setPatients(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete patient');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#0f172a', color: 'white', padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>NALAM AI System Admin Center</div>
            <div style={{ fontSize: 11, color: '#a78bfa' }}>Global Resource & Health Management</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>System Admin</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid #475569', color: '#cbd5e1',
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: 'calc(100vh - 68px)' }}>
        {/* Navigation Sidebar */}
        <aside style={{ background: '#0f172a', color: 'white', padding: '20px 14px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'hospitals', label: 'Hospitals Management', icon: Building2, count: hospitals.length },
            { id: 'asha-workers', label: 'ASHA Workers', icon: UserCheck, count: ashaWorkers.length },
            { id: 'medicines', label: 'Medicine Inventory', icon: Pill, count: medicines.length },
            { id: 'patients', label: 'Patient Details', icon: Users, count: patients.length },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: activeTab === item.id ? '#7c3aed' : 'transparent',
                  color: activeTab === item.id ? 'white' : '#94a3b8',
                  fontWeight: activeTab === item.id ? 700 : 500, fontSize: 13
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <span style={{ fontSize: 11, background: activeTab === item.id ? 'rgba(255,255,255,0.2)' : '#1e293b', padding: '2px 8px', borderRadius: 10 }}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
          {/* 1. HOSPITALS MANAGEMENT */}
          {activeTab === 'hospitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Hospitals Management</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Manage PHCs, CHCs, and Government Hospitals</p>
                </div>
                <button onClick={() => setShowAddHospital(true)} className="btn-primary" style={{ background: '#7c3aed' }}>
                  <Plus size={16} /> Add New Hospital
                </button>
              </div>

              {showAddHospital && (
                <div className="card" style={{ padding: 20, border: '1px solid #7c3aed' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Add Hospital Record</h3>
                  <form onSubmit={handleAddHospital} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Hospital Name</label><input className="form-input" required value={hospitalForm.name} onChange={e => setHospitalForm({ ...hospitalForm, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Location / Village</label><input className="form-input" required value={hospitalForm.location} onChange={e => setHospitalForm({ ...hospitalForm, location: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={hospitalForm.phone} onChange={e => setHospitalForm({ ...hospitalForm, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Medical Officers Count</label><input type="number" className="form-input" value={hospitalForm.doctorCount} onChange={e => setHospitalForm({ ...hospitalForm, doctorCount: parseInt(e.target.value) })} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowAddHospital(false)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary" style={{ background: '#7c3aed' }}>Save Hospital</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Hospital Name</th><th>Location</th><th>Block</th><th>Doctors Count</th><th>Actions</th></tr></thead>
                    <tbody>
                      {hospitals.map(h => (
                        <tr key={h._id}>
                          <td><strong>{h.name}</strong></td>
                          <td>{h.location}</td>
                          <td>{h.block}</td>
                          <td>{h.doctorCount || 3} Doctors</td>
                          <td>
                            <button onClick={() => handleDeleteHospital(h._id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. ASHA WORKERS MANAGEMENT */}
          {activeTab === 'asha-workers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>ASHA Workers Management</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Manage registered ASHA healthcare workers and village assignments</p>
                </div>
                <button onClick={() => setShowAddAsha(true)} className="btn-primary" style={{ background: '#7c3aed' }}>
                  <Plus size={16} /> Register ASHA Worker
                </button>
              </div>

              {showAddAsha && (
                <div className="card" style={{ padding: 20, border: '1px solid #7c3aed' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Register New ASHA Worker</h3>
                  <form onSubmit={handleAddAsha} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" required value={ashaForm.name} onChange={e => setAshaForm({ ...ashaForm, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" required value={ashaForm.email} onChange={e => setAshaForm({ ...ashaForm, email: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" required value={ashaForm.phone} onChange={e => setAshaForm({ ...ashaForm, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Assigned Village</label><input className="form-input" required value={ashaForm.village} onChange={e => setAshaForm({ ...ashaForm, village: e.target.value })} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowAddAsha(false)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary" style={{ background: '#7c3aed' }}>Register Worker</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Assigned Village</th><th>Patients Assigned</th></tr></thead>
                    <tbody>
                      {ashaWorkers.map(w => (
                        <tr key={w._id}>
                          <td><strong>{w.name}</strong></td>
                          <td>{w.email}</td>
                          <td>{w.phone}</td>
                          <td><span className="badge badge-green">{w.village}</span></td>
                          <td>{w.patientCount} Patients</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. MEDICINE INVENTORY MANAGEMENT */}
          {activeTab === 'medicines' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Medicine Stock Management</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Manage PHC central drug inventory and stock quantities</p>
                </div>
                <button onClick={() => setShowAddMedicine(true)} className="btn-primary" style={{ background: '#7c3aed' }}>
                  <Plus size={16} /> Add Medicine Stock
                </button>
              </div>

              {showAddMedicine && (
                <div className="card" style={{ padding: 20, border: '1px solid #7c3aed' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Add Medicine to Stock</h3>
                  <form onSubmit={handleAddMedicine} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Medicine Name</label><input className="form-input" required value={medicineForm.name} onChange={e => setMedicineForm({ ...medicineForm, name: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Generic Name</label><input className="form-input" value={medicineForm.genericName} onChange={e => setMedicineForm({ ...medicineForm, genericName: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={medicineForm.category} onChange={e => setMedicineForm({ ...medicineForm, category: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-input" value={medicineForm.quantity} onChange={e => setMedicineForm({ ...medicineForm, quantity: parseInt(e.target.value) })} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowAddMedicine(false)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary" style={{ background: '#7c3aed' }}>Add Stock</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Medicine Name</th><th>Generic Name</th><th>Category</th><th>Available Quantity</th><th>Actions</th></tr></thead>
                    <tbody>
                      {medicines.map(m => (
                        <tr key={m._id}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.genericName}</td>
                          <td>{m.category}</td>
                          <td><strong style={{ color: m.quantity <= m.lowStockThreshold ? '#dc2626' : '#16a34a' }}>{m.quantity}</strong></td>
                          <td>
                            <button onClick={() => handleDeleteMedicine(m._id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. PATIENT DETAILS MANAGEMENT */}
          {activeTab === 'patients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Registered Patients Management</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>View and manage patient profile records</p>
                </div>
                <div style={{ width: 260 }}>
                  <input
                    className="form-input"
                    placeholder="Search patient by name/village..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Patient Name</th><th>Age / Gender</th><th>Village</th><th>Blood Group</th><th>Phone</th><th>Actions</th></tr></thead>
                    <tbody>
                      {patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.village?.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <tr key={p._id}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.age} Yrs · {p.gender}</td>
                          <td>{p.village}</td>
                          <td>{p.bloodGroup}</td>
                          <td>{p.phone}</td>
                          <td>
                            <button onClick={() => handleDeletePatient(p._id)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
