import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', village: '', district: '',
    role: 'asha_worker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f4c25 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(22,163,74,0.4)'
          }}>
            <Heart size={26} color="white" fill="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>NALAM AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Create your ASHA Worker account</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Register Account</h2>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Your full name" value={formData.name} onChange={e => update('name', e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" className="form-input" style={{ paddingLeft: 36 }} placeholder="your@email.com" value={formData.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" className="form-input" style={{ paddingLeft: 36 }} placeholder="Min 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} required minLength={6} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="form-input" style={{ paddingLeft: 36 }} placeholder="10-digit number" value={formData.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={formData.role} onChange={e => update('role', e.target.value)}>
                  <option value="asha_worker">ASHA Worker</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Village</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Village name" value={formData.village} onChange={e => update('village', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-input" placeholder="District" value={formData.district} onChange={e => update('district', e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Registering...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 18 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
