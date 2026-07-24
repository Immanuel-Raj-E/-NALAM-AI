import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Shield, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', village: user?.village || '', district: user?.district || '', state: user?.state || 'Tamil Nadu' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>My Profile</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Manage your ASHA worker account information</p>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Profile Card */}
          <div>
            <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 88, height: 88, borderRadius: 24,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 36, fontWeight: 800, color: 'white',
                boxShadow: '0 8px 24px rgba(22,163,74,0.3)'
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', display: 'inline-block', padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
                ASHA Worker
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <InfoRow icon={<Mail size={14} />} value={user?.email} />
                <InfoRow icon={<Phone size={14} />} value={user?.phone || 'Not set'} />
                <InfoRow icon={<MapPin size={14} />} value={`${user?.village || 'Village'}, ${user?.district || 'District'}`} />
                <InfoRow icon={<Shield size={14} />} value={user?.state || 'Tamil Nadu'} />
              </div>
            </div>

            {/* Account Info */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Account Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Role</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>ASHA Worker</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 13, color: '#1e293b' }}>{user?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Member Since</div>
                  <div style={{ fontSize: 13, color: '#1e293b' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#16a34a" />
              Edit Profile Information
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Email (cannot change)</label>
                <input className="form-input" value={user?.email} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="10-digit number" value={form.phone} onChange={e => upd('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={e => upd('state', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Village</label>
                <input className="form-input" placeholder="Your village" value={form.village} onChange={e => upd('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-input" placeholder="District" value={form.district} onChange={e => upd('district', e.target.value)} />
              </div>

              <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
                  {saved ? (
                    <><CheckCircle size={16} /> Profile Updated!</>
                  ) : loading ? (
                    <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Saving...</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ color: '#94a3b8' }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#374151' }}>{value}</span>
    </div>
  );
}
