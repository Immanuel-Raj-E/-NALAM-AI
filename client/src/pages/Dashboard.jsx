import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, Calendar, Package, CheckSquare, Bell, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { patientAPI, appointmentAPI, medicineAPI, reminderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#16a34a', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, highRisk: 0, medium: 0, low: 0 });
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, apptRes, medRes, remRes, upRes, lsRes] = await Promise.all([
          patientAPI.getStats(),
          appointmentAPI.getAll({ upcoming: true }),
          medicineAPI.getAll({ lowStock: true }),
          reminderAPI.getAll({ upcoming: true }),
          appointmentAPI.getUpcomingCount(),
          medicineAPI.getLowStockCount(),
        ]);
        setStats(statsRes.data.data);
        setAppointments(apptRes.data.data.slice(0, 5));
        setMedicines(medRes.data.data.slice(0, 4));
        setReminders(remRes.data.data.slice(0, 4));
        setUpcomingCount(upRes.data.data.count);
        setLowStockCount(lsRes.data.data.count);
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const riskPieData = [
    { name: 'Low Risk', value: stats.low },
    { name: 'Medium Risk', value: stats.medium },
    { name: 'High Risk', value: stats.highRisk },
  ];

  const weeklyData = [
    { day: 'Mon', visits: 4 }, { day: 'Tue', visits: 7 }, { day: 'Wed', visits: 5 },
    { day: 'Thu', visits: 9 }, { day: 'Fri', visits: 6 }, { day: 'Sat', visits: 3 }, { day: 'Sun', visits: 2 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
            Namaste, {user?.name?.split(' ')[0]}!
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>
            Here's your healthcare overview for today
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard
            icon={<Users size={24} color="#16a34a" />}
            iconBg="#dcfce7"
            label="Total Patients"
            value={stats.total}
            sublabel="Under your care"
            linkTo="/patients"
          />
          <StatCard
            icon={<AlertTriangle size={24} color="#ef4444" />}
            iconBg="#fee2e2"
            label="High-Risk Patients"
            value={stats.highRisk}
            sublabel="Need attention"
            linkTo="/patients"
            accent="#ef4444"
          />
          <StatCard
            icon={<Calendar size={24} color="#0ea5e9" />}
            iconBg="#e0f2fe"
            label="Upcoming Appointments"
            value={upcomingCount}
            sublabel="Scheduled"
            linkTo="/appointments"
            accent="#0ea5e9"
          />
          <StatCard
            icon={<Package size={24} color="#f59e0b" />}
            iconBg="#fef9c3"
            label="Low Stock Medicines"
            value={lowStockCount}
            sublabel="Need restocking"
            linkTo="/medicines"
            accent="#f59e0b"
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Weekly Visits Chart */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Weekly Patient Visits</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="visits" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Patient Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {riskPieData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Patients']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Upcoming Appointments */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                <Calendar size={15} style={{ display: 'inline', marginRight: 6, color: '#0ea5e9' }} />
                Upcoming Appointments
              </h3>
              <Link to="/appointments" style={{ fontSize: 12, color: '#16a34a', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {appointments.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No upcoming appointments</p>
            ) : appointments.map((appt) => (
              <div key={appt._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{appt.patient?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{appt.doctorName} · {appt.hospitalName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600 }}>
                    {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{appt.appointmentTime}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Reminders & Low Stock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Reminders */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                  <Bell size={15} style={{ display: 'inline', marginRight: 6, color: '#f59e0b' }} />
                  Today's Reminders
                </h3>
              </div>
              {reminders.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>No reminders this week</p>
              ) : reminders.slice(0, 3).map((r) => (
                <div key={r._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: r.priority === 'High' ? '#ef4444' : r.priority === 'Medium' ? '#f59e0b' : '#16a34a'
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                      {new Date(r.reminderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {r.reminderTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Low Stock */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                  <Package size={15} style={{ display: 'inline', marginRight: 6, color: '#ef4444' }} />
                  Low Stock Alert
                </h3>
                <Link to="/medicines" style={{ fontSize: 12, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
              </div>
              {medicines.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>All medicines in stock</p>
              ) : medicines.map((med) => (
                <div key={med._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{med.name}</div>
                  <span className="badge badge-red">{med.quantity} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, sublabel, linkTo, accent = '#16a34a' }) {
  return (
    <Link to={linkTo} style={{ textDecoration: 'none' }}>
      <div className="stat-card card-interactive">
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{label}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sublabel}</div>
        </div>
      </div>
    </Link>
  );
}
