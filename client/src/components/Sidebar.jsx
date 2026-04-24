import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap, LayoutDashboard, MessageSquare, BarChart2,
  LogOut, ChevronRight, User
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',      icon: MessageSquare,   label: 'Practice' },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  // Generate initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={20} color="#6c63ff" />
        </div>
        <span className="sidebar-logo-text">Verbalytics<span className="gradient-text"> AI</span></span>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="sidebar-arrow" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>

      {/* VANSH Signature — always visible */}
      <div className="sidebar-jaat">
        <span>by <strong>VANSH</strong></span>
      </div>

      <style>{`
        .sidebar {
          width: 240px; min-width: 240px;
          height: 100vh; position: sticky; top: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 24px 0;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px 28px; border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .sidebar-logo-icon {
          width: 36px; height: 36px; background: #6c63ff15;
          border: 1px solid #6c63ff30; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sidebar-logo-text { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; flex: 1; }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none; color: var(--text-secondary);
          font-size: 0.875rem; font-weight: 500;
          transition: all 0.2s; position: relative;
        }
        .sidebar-link:hover { background: var(--bg-card); color: var(--text-primary); }
        .sidebar-link-active {
          background: #6c63ff15 !important; color: var(--accent-secondary) !important;
          border: 1px solid #6c63ff25;
        }
        .sidebar-arrow { margin-left: auto; opacity: 0.6; }

        .sidebar-footer {
          padding: 16px 12px 0;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
          margin-top: auto;
        }
        .sidebar-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .sidebar-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
        .sidebar-user-name { font-size: 0.825rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-email { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-logout {
          background: none; border: 1px solid var(--border); border-radius: 8px;
          color: var(--text-muted); cursor: pointer; padding: 7px; display: flex;
          align-items: center; transition: all 0.2s; flex-shrink: 0;
        }
        .sidebar-logout:hover { background: #f43f5e15; border-color: #f43f5e40; color: #f43f5e; }

        /* VANSH signature */
        .sidebar-jaat {
          text-align: center;
          padding: 10px 0 4px;
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .sidebar-jaat strong {
          background: linear-gradient(90deg, #6c63ff, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          font-weight: 800; letter-spacing: 0.1em;
        }
      `}</style>
    </aside>
  );
}
