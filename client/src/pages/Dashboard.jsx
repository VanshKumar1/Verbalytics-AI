import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
  MessageSquare, TrendingUp, Target, Award,
  Swords, BriefcaseBusiness, BarChart3,
  ChevronRight, Clock, Flame
} from 'lucide-react';

const MODE_CARDS = [
  {
    id: 'debate',
    icon: Swords,
    label: 'Debate Mode',
    desc: 'AI argues the opposing side. Sharpen your counter-arguments and critical thinking.',
    color: '#6c63ff',
    bg: '#6c63ff15',
    border: '#6c63ff30',
    badge: 'Most Popular',
  },
  {
    id: 'interview',
    icon: BriefcaseBusiness,
    label: 'Interview Mode',
    desc: 'AI acts as your interviewer. Get asked one question at a time with adaptive difficulty.',
    color: '#22d3ee',
    bg: '#22d3ee12',
    border: '#22d3ee30',
    badge: 'Career Prep',
  },
  {
    id: 'evaluate',
    icon: BarChart3,
    label: 'Evaluation Mode',
    desc: 'Get scored on Logic, Clarity, and Relevance. Receive structured AI feedback instantly.',
    color: '#10b981',
    bg: '#10b98115',
    border: '#10b98130',
    badge: 'Feedback',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/sessions');
        setSessions(data.sessions || []);
      } catch {
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, []);

  const stats = [
    {
      label: 'Total Sessions',
      value: user?.totalSessions ?? 0,
      icon: MessageSquare,
      color: '#6c63ff',
      bg: '#6c63ff15',
    },
    {
      label: 'Avg. Logic Score',
      value: `${(user?.avgLogicScore ?? 0).toFixed(1)}/10`,
      icon: TrendingUp,
      color: '#10b981',
      bg: '#10b98115',
    },
    {
      label: 'Avg. Clarity',
      value: `${(user?.avgClarityScore ?? 0).toFixed(1)}/10`,
      icon: Target,
      color: '#22d3ee',
      bg: '#22d3ee15',
    },
    {
      label: 'Avg. Relevance',
      value: `${(user?.avgRelevanceScore ?? 0).toFixed(1)}/10`,
      icon: Award,
      color: '#f59e0b',
      bg: '#f59e0b15',
    },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content bg-mesh">
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="dash-greeting">{greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p className="dash-sub">Ready to sharpen your skills? Pick a mode below.</p>
          </div>
          <div className="dash-avatar-wrap">
            <div className="dash-avatar">{initials}</div>
          </div>
        </header>

        {/* Stats */}
        <section className="dash-stats">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon-wrap" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Mode Cards */}
        <section className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Start a Session</h2>
            <span className="badge badge-primary"><Flame size={11} /> Choose your mode</span>
          </div>
          <div className="mode-cards">
            {MODE_CARDS.map(({ id, icon: Icon, label, desc, color, bg, border, badge }) => (
              <button
                key={id}
                id={`mode-card-${id}`}
                className="mode-card glass"
                onClick={() => navigate(`/chat?mode=${id}`)}
                style={{ '--card-color': color, '--card-bg': bg, '--card-border': border }}
              >
                <div className="mode-card-top">
                  <div className="mode-icon-wrap" style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="mode-badge" style={{ background: bg, color, border: `1px solid ${border}` }}>{badge}</span>
                </div>
                <h3 className="mode-title">{label}</h3>
                <p className="mode-desc">{desc}</p>
                <div className="mode-cta">
                  Start now <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Recent Sessions</h2>
            <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => navigate('/analytics')}>
              View All
            </button>
          </div>

          {loadingSessions ? (
            <div className="sessions-loading">
              <div className="spinner" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="sessions-empty glass">
              <Clock size={36} style={{ color: 'var(--text-muted)' }} />
              <p>No sessions yet. Start practicing to see your history here!</p>
              <button className="btn btn-primary" onClick={() => navigate('/chat')}>
                Start First Session
              </button>
            </div>
          ) : (
            <div className="sessions-list glass">
              {sessions.slice(0, 5).map((s) => (
                <div key={s._id} className="session-row">
                  <div className="session-mode-dot" style={{ background: s.mode === 'debate' ? '#6c63ff' : s.mode === 'interview' ? '#22d3ee' : '#10b981' }} />
                  <div className="session-info">
                    <span className="session-mode">{s.mode.charAt(0).toUpperCase() + s.mode.slice(1)} Mode</span>
                    <span className="session-date">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  {s.avgScore != null && (
                    <div className="session-score" style={{ color: s.avgScore >= 7 ? '#10b981' : s.avgScore >= 5 ? '#f59e0b' : '#f43f5e' }}>
                      {s.avgScore.toFixed(1)}/10
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .app-shell { display: flex; min-height: 100vh; }
        .main-content { flex: 1; padding: 36px 40px; overflow-y: auto; display: flex; flex-direction: column; gap: 36px; }

        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .dash-greeting { font-size: 1.9rem; margin-bottom: 6px; }
        .dash-sub { color: var(--text-secondary); font-size: 0.9rem; }
        .dash-avatar-wrap {}
        .dash-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: #fff;
          box-shadow: 0 0 20px #6c63ff40;
        }

        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .stat-card {
          display: flex; align-items: center; gap: 14px;
          padding: 20px; border-radius: 14px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-icon-wrap { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-value { font-size: 1.45rem; font-weight: 800; font-family: 'Outfit', sans-serif; }
        .stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

        .dash-section { display: flex; flex-direction: column; gap: 16px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; }
        .section-title { font-size: 1.1rem; font-weight: 700; }

        .mode-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .mode-card {
          text-align: left; padding: 24px; cursor: pointer;
          display: flex; flex-direction: column; gap: 12px;
          border: 1px solid var(--border); transition: all 0.25s;
          background: var(--bg-card);
        }
        .mode-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-border) !important;
          box-shadow: 0 12px 40px color-mix(in srgb, var(--card-color) 20%, transparent);
        }
        .mode-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .mode-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .mode-badge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
        .mode-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .mode-desc { font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; }
        .mode-cta { display: flex; align-items: center; gap: 4px; font-size: 0.825rem; font-weight: 600; color: var(--accent-secondary); margin-top: 4px; }

        .sessions-loading { display: flex; justify-content: center; padding: 40px; }
        .sessions-empty {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 48px; text-align: center; border-radius: 14px;
          color: var(--text-secondary); font-size: 0.9rem;
        }
        .sessions-list { border-radius: 14px; overflow: hidden; }
        .session-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 20px;
          border-bottom: 1px solid var(--border); transition: background 0.2s;
        }
        .session-row:last-child { border-bottom: none; }
        .session-row:hover { background: var(--bg-card-hover); }
        .session-mode-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .session-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .session-mode { font-size: 0.875rem; font-weight: 600; }
        .session-date { font-size: 0.78rem; color: var(--text-muted); }
        .session-score { font-weight: 700; font-size: 0.9rem; }

        @media (max-width: 1100px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .mode-cards { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .main-content { padding: 20px; }
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .mode-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
