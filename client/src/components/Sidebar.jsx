import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bot, FileText, ClipboardList, Calendar,
  Building2, Stethoscope, Pill, Syringe, User, LogOut, ChevronLeft,
  ChevronRight, Heart, Bell, HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/prescription-generator', label: 'Prescription Generator', icon: FileText },
  { path: '/reports', label: 'Medical Reports', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/vaccinations', label: 'Vaccinations', icon: Syringe },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Heart size={22} color="white" fill="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              NALAM AI
            </div>
            <div style={{ color: '#4ade80', fontSize: 11, fontWeight: 500, marginTop: 1 }}>
              Healthcare Assistant
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.1)',
            border: 'none', color: '#94a3b8', cursor: 'pointer',
            borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center',
            flexShrink: 0
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 12,
            padding: '10px 12px', marginBottom: 8
          }}>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
              {user?.name}
            </div>
            <div style={{ color: '#4ade80', fontSize: 11, fontWeight: 600 }}>
              ASHA Worker ({user?.ashaWorkerId || 'ASHA-101'}) · {user?.village || 'Mathur'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
