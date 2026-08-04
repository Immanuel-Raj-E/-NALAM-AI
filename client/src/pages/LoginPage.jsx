import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle, UserCheck, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [roleTab, setRoleTab] = useState('asha_worker'); // asha_worker | patient | admin
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleTabChange = (role) => {
    setRoleTab(role);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'patient') {
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

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 8px 30px rgba(22,163,74,0.4)'
          }}>
            <Heart size={36} color="white" fill="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>NALAM AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Rural Primary Healthcare Intelligence Platform</p>
        </div>

        {/* Card Container */}
        <div className="card" style={{ padding: 32, background: 'white', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          
          {/* Role Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: 4, background: '#f1f5f9', borderRadius: 14, marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => handleRoleTabChange('asha_worker')}
              style={{
                padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: roleTab === 'asha_worker' ? 'white' : 'transparent',
                color: roleTab === 'asha_worker' ? '#16a34a' : '#64748b',
                fontWeight: roleTab === 'asha_worker' ? 700 : 500, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                boxShadow: roleTab === 'asha_worker' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserCheck size={14} /> ASHA Worker
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('patient')}
              style={{
                padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: roleTab === 'patient' ? 'white' : 'transparent',
                color: roleTab === 'patient' ? '#0ea5e9' : '#64748b',
                fontWeight: roleTab === 'patient' ? 700 : 500, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                boxShadow: roleTab === 'patient' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={14} /> Patient
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              style={{
                padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: roleTab === 'admin' ? 'white' : 'transparent',
                color: roleTab === 'admin' ? '#7c3aed' : '#64748b',
                fontWeight: roleTab === 'admin' ? 700 : 500, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                boxShadow: roleTab === 'admin' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={14} /> Admin
            </button>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            Sign in to {roleTab === 'asha_worker' ? 'ASHA Portal' : roleTab === 'patient' ? 'Patient Care' : 'Admin Control Center'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
            {roleTab === 'asha_worker' ? 'Access patient records, health visits, and prescriptions' : roleTab === 'patient' ? 'Access your health records, prescriptions, and appointments' : 'Manage hospitals, ASHA workers, medicines, and patients'}
          </p>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
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
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
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
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 14, marginTop: 4, background: roleTab === 'admin' ? '#7c3aed' : roleTab === 'patient' ? '#0ea5e9' : '#16a34a' }}
            >
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Signing in...</> : `Sign In as ${roleTab === 'asha_worker' ? 'ASHA Worker' : roleTab === 'patient' ? 'Patient' : 'System Admin'}`}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
