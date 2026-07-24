import { useState, useEffect } from 'react';
import { hospitalAPI } from '../services/api';
import { Building2, Phone, MapPin, Search, CheckCircle2 } from 'lucide-react';

const TYPE_COLORS = { Government: 'badge-blue', PHC: 'badge-green', CHC: 'badge-purple', Private: 'badge-gray' };

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hospitalAPI.getAll({ search: search || undefined, type: typeFilter || undefined }).then(res => {
      setHospitals(res.data.data);
    }).finally(() => setLoading(false));
  }, [search, typeFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Nearby Hospitals</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Hospitals and health centres in Krishnagiri district</p>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input className="form-input" placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['', 'Government', 'PHC', 'CHC'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '7px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: typeFilter === t ? '#16a34a' : '#e2e8f0',
                background: typeFilter === t ? '#dcfce7' : 'white',
                color: typeFilter === t ? '#16a34a' : '#64748b',
                fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {hospitals.map(h => (
              <div key={h.id} className="card card-interactive" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.3, marginBottom: 4 }}>{h.name}</div>
                    <span className={`badge ${TYPE_COLORS[h.type] || 'badge-gray'}`}>{h.type}</span>
                  </div>
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '6px 12px', textAlign: 'center', marginLeft: 12, flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{h.distance}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>distance</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  <MapPin size={13} color="#94a3b8" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{h.address}</span>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
                  <Building2 size={13} color="#94a3b8" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{h.beds} beds</span>
                </div>

                {/* Services */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {h.services.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f0fdf4', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle2 size={10} />{s}
                    </div>
                  ))}
                </div>

                <a href={`tel:${h.phone}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                  borderRadius: 10, padding: '10px', textDecoration: 'none',
                  fontSize: 13, fontWeight: 700, boxShadow: '0 2px 8px rgba(22,163,74,0.25)'
                }}>
                  <Phone size={14} /> {h.phone}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
