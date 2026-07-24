import { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import { Search, Stethoscope, Phone, Clock, Building2 } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const specialties = ['', 'General Medicine', 'Pediatrics', 'Gynecology & Obstetrics', 'Cardiology', 'Dermatology', 'Orthopedics', 'ENT', 'Ophthalmology'];

  useEffect(() => {
    setLoading(true);
    doctorAPI.getAll({ search: search || undefined, specialty: specialty || undefined }).then(res => {
      setDoctors(res.data.data);
    }).finally(() => setLoading(false));
  }, [search, specialty]);

  const COLORS = ['#16a34a', '#0ea5e9', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#2563eb', '#0891b2'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Doctor Directory</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Find doctors by specialty and hospital</p>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input className="form-input" placeholder="Search doctors, specialty, hospital..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 200 }} value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option value="">All Specialties</option>
            {specialties.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {doctors.map((d, idx) => (
              <div key={d.id} className="card card-interactive" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, ${COLORS[idx % COLORS.length]}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 20
                  }}>
                    {d.name.charAt(3).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>{d.specialty}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{d.experience} experience</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  <Building2 size={13} color="#64748b" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{d.hospital}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14 }}>
                  <Clock size={13} color="#64748b" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{d.availability}</span>
                </div>

                <a href={`tel:${d.phone}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                  borderRadius: 10, padding: '10px', textDecoration: 'none',
                  fontSize: 13, fontWeight: 700
                }}>
                  <Phone size={14} /> {d.phone}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
