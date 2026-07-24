import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle, UserCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [roleTab, setRoleTab] = useState('asha_worker'); // asha_worker | patient
  const [formData, setFormData] = useState({ email: 'meena@nalamhealth.in', password: 'asha1234' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleTabChange = (role) => {
    setRoleTab(role);
    setError('');
    if (role === 'asha_worker') {
      setFormData({ email: 'meena@nalamhealth.in', password: 'asha1234' });
    } else {
      setFormData({ email: 'lakshmi@nalamhealth.in', password: 'patient123' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'patient') {
        navigate('/patient-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f4c25 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(22,163,74,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(14,165,233,0.06)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(22,163,74,0.4)'
          }}>
            <Heart size={32} color="white" fill="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>NALAM AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Rural Healthcare & Patient Portal Platform</p>
        </div>

        {/* Role Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => handleRoleTabChange('asha_worker')}
            style={{
              padding: '12px', borderRadius: 14, border: '2px solid',
              borderColor: roleTab === 'asha_worker' ? '#22c55e' : 'rgba(255,255,255,0.1)',
              background: roleTab === 'asha_worker' ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)',
              color: roleTab === 'asha_worker' ? '#4ade80' : '#94a3b8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Stethoscope size={16} /> ASHA Worker Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('patient')}
            style={{
              padding: '12px', borderRadius: 14, border: '2px solid',
              borderColor: roleTab === 'patient' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              background: roleTab === 'patient' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)',
              color: roleTab === 'patient' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <UserCheck size={16} /> Patient Login
          </button>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 36, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
            {roleTab === 'asha_worker' ? 'ASHA Worker Portal' : 'Patient Health Portal'}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {roleTab === 'asha_worker'
              ? 'Sign in to manage patient records, inventory & AI assistance'
              : 'Sign in to view your health records, prescriptions & appointments'}
          </p>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder={roleTab === 'asha_worker' ? 'meena@nalamhealth.in' : 'lakshmi@nalamhealth.in'}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  id="email-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  id="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15, marginTop: 4 }}
              id="login-btn"
            >
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Signing in...</> : `Sign In as ${roleTab === 'asha_worker' ? 'ASHA Worker' : 'Patient'}`}
            </button>
          </form>

          {/* Demo credentials box */}
          <div style={{ background: roleTab === 'asha_worker' ? '#f0fdf4' : '#f0f9ff', border: `1px solid ${roleTab === 'asha_worker' ? '#bbf7d0' : '#bae6fd'}`, borderRadius: 10, padding: '12px 14px', marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: roleTab === 'asha_worker' ? '#16a34a' : '#0284c7', marginBottom: 4 }}>
              Demo Credentials ({roleTab === 'asha_worker' ? 'ASHA Worker' : 'Patient Profile'})
            </div>
            <div style={{ fontSize: 12, color: '#334155' }}>Email: <strong>{roleTab === 'asha_worker' ? 'meena@nalamhealth.in' : 'lakshmi@nalamhealth.in'}</strong></div>
            <div style={{ fontSize: 12, color: '#334155' }}>Password: <strong>{roleTab === 'asha_worker' ? 'asha1234' : 'patient123'}</strong></div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
