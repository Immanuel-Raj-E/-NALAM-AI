import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSOS, setShowSOS] = useState(false);

  return (
    <>
      <nav className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onMenuClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', color: '#64748b' }}
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{title}</h1>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowSOS(!showSOS)}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '8px 14px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(239,68,68,0.4)'
            }}
          >
            <Phone size={14} />
            SOS
          </button>
          <button
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 12, padding: '5px 12px', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Go to Profile"
            id="profile-nav-btn"
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
              {user?.name?.split(' ')[0] || 'Profile'}
            </span>
          </button>
        </div>
      </nav>

      {/* SOS Panel */}
      {showSOS && (
        <div style={{
          position: 'fixed', top: 70, right: 20,
          background: 'white', borderRadius: 16, padding: 20,
          width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000, border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚨 Emergency Contacts
          </div>
          {[
            { label: 'Ambulance', number: '108', color: '#ef4444' },
            { label: 'Emergency', number: '112', color: '#dc2626' },
            { label: 'ASHA Helpline', number: '104', color: '#2563eb' },
            { label: 'Child Helpline', number: '1098', color: '#7c3aed' },
            { label: 'Women Helpline', number: '181', color: '#db2777' },
          ].map(({ label, number, color }) => (
            <div key={number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
              <a href={`tel:${number}`} style={{ color, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>{number}</a>
            </div>
          ))}
          <button onClick={() => setShowSOS(false)} style={{ marginTop: 12, width: '100%', padding: 8, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
