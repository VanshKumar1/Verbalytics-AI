import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  TrendingUp, Target, Award, MessageSquare,
  Swords, BriefcaseBusiness, BarChart3,
  AlertTriangle, Star, Trophy, Zap,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';

// ── Custom Tooltip for Recharts ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#16161f', border: '1px solid #ffffff15',
      borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem',
    }}>
      {label && <p style={{ color: '#a09ab8', marginBottom: 6 }}>{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Score Trend Arrow ─────────────────────────────────────────────────────────
function TrendIcon({ value }) {
  if (value > 6.5) return <ArrowUpRight size={16} style={{ color: '#10b981' }} />;
  if (value < 4)   return <ArrowDownRight size={16} style={{ color: '#f43f5e' }} />;
  return <Minus size={16} style={{ color: '#f59e0b' }} />;
}

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#f43f5e';
  return (
    <span style={{
      color, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
      fontSize: '0.9rem',
    }}>
      {score?.toFixed(1) ?? '–'}/10
    </span>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]           = useState(null);
  const [evaluations, setEvals]     = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, evalsRes, sessRes] = await Promise.all([
          api.get('/evaluations/stats'),
          api.get('/evaluations'),
          api.get('/sessions'),
        ]);
        setStats(statsRes.data);
        setEvals(evalsRes.data.evaluations || []);
        setAllSessions(sessRes.data.sessions || []);
      } catch {
        // silently fail — shows empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Build chart data ─────────────────────────────────────────────────────
  const progressData = (stats?.recentEvals || []).map((e, i) => ({
    name: `#${i + 1}`,
    Logic:     e.scores?.logic     ?? 0,
    Clarity:   e.scores?.clarity   ?? 0,
    Relevance: e.scores?.relevance ?? 0,
    Avg:       e.avgScore          ?? 0,
    topic:     e.topic,
  }));

  const radarData = [
    { subject: 'Logic',     A: stats?.averages?.Logic     || 0, fullMark: 10 },
    { subject: 'Clarity',   A: stats?.averages?.Clarity   || 0, fullMark: 10 },
    { subject: 'Relevance', A: stats?.averages?.Relevance || 0, fullMark: 10 },
  ];

  const sessionByModeData = [
    { name: 'Debate',    sessions: stats?.sessionCounts?.debate    || 0, fill: '#6c63ff' },
    { name: 'Interview', sessions: stats?.sessionCounts?.interview || 0, fill: '#22d3ee' },
    { name: 'Evaluate',  sessions: stats?.sessionCounts?.evaluate  || 0, fill: '#10b981' },
  ];

  const overallAvg = stats?.averages
    ? +((stats.averages.Logic + stats.averages.Clarity + stats.averages.Relevance) / 3).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  const TABS = ['overview', 'progress', 'sessions'];

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="analytics-main bg-mesh">

        {/* ── Header ────────────────────────────────────────── */}
        <header className="analytics-header">
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>
              📊 <span className="gradient-text">Analytics</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Track your performance and identify areas to improve.
            </p>
          </div>
          <button
            id="start-practice-btn"
            className="btn btn-primary"
            onClick={() => navigate('/chat')}
          >
            <Zap size={15} /> Start Practice
          </button>
        </header>

        {/* ── KPI Strip ───────────────────────────────────────── */}
        <section className="kpi-strip">
          {[
            {
              label: 'Total Sessions', value: stats?.totalSessions ?? 0,
              icon: MessageSquare, color: '#6c63ff', bg: '#6c63ff15',
            },
            {
              label: 'Avg. Logic', value: `${(stats?.averages?.Logic ?? 0).toFixed(1)}/10`,
              icon: TrendingUp, color: '#10b981', bg: '#10b98115',
            },
            {
              label: 'Avg. Clarity', value: `${(stats?.averages?.Clarity ?? 0).toFixed(1)}/10`,
              icon: Target, color: '#22d3ee', bg: '#22d3ee15',
            },
            {
              label: 'Avg. Relevance', value: `${(stats?.averages?.Relevance ?? 0).toFixed(1)}/10`,
              icon: Award, color: '#f59e0b', bg: '#f59e0b15',
            },
            {
              label: 'Overall Avg.', value: `${overallAvg}/10`,
              icon: Trophy, color: '#a78bfa', bg: '#a78bfa15',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="kpi-card glass">
              <div className="kpi-icon" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="kpi-value">{value}</p>
                <p className="kpi-label">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="analytics-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              className={`tab-btn ${activeTab === t ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="analytics-grid">

            {/* Radar Chart — skill balance */}
            <div className="analytics-card glass">
              <h3 className="card-title">Skill Balance</h3>
              <p className="card-sub">Your average scores across all 3 dimensions</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff0f" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a09ab8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                  <Radar
                    name="Score" dataKey="A"
                    stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Sessions by Mode Bar */}
            <div className="analytics-card glass">
              <h3 className="card-title">Sessions by Mode</h3>
              <p className="card-sub">How you've been practicing</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sessionByModeData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#a09ab8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a09ab8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
                    {sessionByModeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weakest Skill callout */}
            {stats?.weakestSkill && (
              <div className="analytics-card glass weakness-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#f59e0b15', padding: 10, borderRadius: 10, border: '1px solid #f59e0b30' }}>
                    <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <h3 className="card-title" style={{ marginBottom: 2 }}>Focus Area</h3>
                    <p className="card-sub">Based on your evaluation history</p>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Your weakest dimension is currently{' '}
                    <strong style={{ color: '#f59e0b', fontSize: '1rem' }}>{stats.weakestSkill}</strong>.
                    Try the <strong>Evaluate Mode</strong> with targeted topics to improve this score.
                    Focus on structuring your response clearly with evidence and staying on-topic.
                  </p>
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: 14, fontSize: '0.825rem', padding: '8px 16px' }}
                    onClick={() => navigate('/chat?mode=evaluate')}
                  >
                    <BarChart3 size={14} /> Practice Evaluate Mode
                  </button>
                </div>
              </div>
            )}

            {/* Best Session */}
            {stats?.bestSession && (
              <div className="analytics-card glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Star size={16} style={{ color: '#f59e0b' }} />
                  <h3 className="card-title">Best Session</h3>
                </div>
                <div className="best-session-info">
                  <div className="score-ring">
                    {stats.bestSession.avgScore?.toFixed(1)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{stats.bestSession.topic || 'Untitled'}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['logic', 'clarity', 'relevance'].map((k) => (
                        <span key={k} className="mini-badge">
                          {k.charAt(0).toUpperCase() + k.slice(1)}: {stats.bestSession.scores?.[k] ?? '–'}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {new Date(stats.bestSession.createdAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Progress Tab ──────────────────────────────────────── */}
        {activeTab === 'progress' && (
          <div className="analytics-col">
            {progressData.length === 0 ? (
              <EmptyState
                icon={<TrendingUp size={44} style={{ color: '#6c63ff', opacity: 0.5 }} />}
                title="No Evaluation Data Yet"
                desc="Complete at least one Evaluate Mode session to see your progress chart."
                action={() => navigate('/chat?mode=evaluate')}
                actionLabel="Start Evaluation"
              />
            ) : (
              <>
                {/* Line chart */}
                <div className="analytics-card glass">
                  <h3 className="card-title">Score Progression</h3>
                  <p className="card-sub">Your last {progressData.length} evaluation sessions</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={progressData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="name" tick={{ fill: '#a09ab8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#a09ab8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: '0.8rem', paddingTop: 12 }}
                        formatter={(v) => <span style={{ color: '#a09ab8' }}>{v}</span>}
                      />
                      <Line type="monotone" dataKey="Logic"     stroke="#6c63ff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Clarity"   stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Relevance" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Avg"       stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-session breakdown */}
                <div className="analytics-card glass">
                  <h3 className="card-title">Evaluation Breakdown</h3>
                  <p className="card-sub">Scores per evaluation topic</p>
                  <div className="eval-breakdown-list">
                    {evaluations.map((ev, idx) => (
                      <div key={ev._id} className="eval-breakdown-row">
                        <div className="eval-num">#{idx + 1}</div>
                        <div className="eval-info">
                          <p className="eval-topic">{ev.topic || 'Untitled'}</p>
                          <p className="eval-date">
                            {new Date(ev.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="eval-row-scores">
                          {['logic', 'clarity', 'relevance'].map((k) => (
                            <div key={k} className="eval-mini-score">
                              <span className="eval-mini-label">{k.slice(0,3).toUpperCase()}</span>
                              <ScoreBadge score={ev.scores?.[k]} />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ScoreBadge score={ev.avgScore} />
                          <TrendIcon value={ev.avgScore} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Sessions Tab ──────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <div className="analytics-col">
            {allSessions.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={44} style={{ color: '#6c63ff', opacity: 0.5 }} />}
                title="No Sessions Yet"
                desc="Start a Debate, Interview, or Evaluate session to see your history."
                action={() => navigate('/chat')}
                actionLabel="Start Session"
              />
            ) : (
              <div className="analytics-card glass">
                <h3 className="card-title">All Sessions ({allSessions.length})</h3>
                <div style={{ marginTop: 16 }}>
                  {allSessions.map((s) => {
                    const ModeIcon = s.mode === 'debate' ? Swords : s.mode === 'interview' ? BriefcaseBusiness : BarChart3;
                    const modeColor = s.mode === 'debate' ? '#6c63ff' : s.mode === 'interview' ? '#22d3ee' : '#10b981';
                    const modeBg    = s.mode === 'debate' ? '#6c63ff15' : s.mode === 'interview' ? '#22d3ee12' : '#10b98115';
                    return (
                      <div key={s._id} className="session-full-row">
                        <div className="session-mode-icon" style={{ background: modeBg, border: `1px solid ${modeColor}30` }}>
                          <ModeIcon size={16} style={{ color: modeColor }} />
                        </div>
                        <div className="session-full-info">
                          <p className="session-full-topic">{s.topic || 'Untitled topic'}</p>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="mini-badge" style={{ background: modeBg, color: modeColor }}>
                              {s.mode.charAt(0).toUpperCase() + s.mode.slice(1)}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(s.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </span>
                            {s.difficulty && (
                              <span className="mini-badge">
                                {s.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        {s.avgScore != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ScoreBadge score={s.avgScore} />
                            <TrendIcon value={s.avgScore} />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {s.isComplete ? '–' : 'In progress'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{analyticsStyles}</style>
    </div>
  );
}

// ── Empty State component ─────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <div className="analytics-card glass empty-state">
      {icon}
      <h3 style={{ marginTop: 16, fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 360, lineHeight: 1.7 }}>{desc}</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={action}>
        {actionLabel}
      </button>
    </div>
  );
}

const analyticsStyles = `
/* ── Layout ──────────────────────────────────────── */
.analytics-main {
  flex: 1; padding: 36px 40px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 28px;
}
.analytics-header {
  display: flex; justify-content: space-between; align-items: flex-start;
}

/* ── KPI Strip ───────────────────────────────────── */
.kpi-strip {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
}
.kpi-card {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px;
}
.kpi-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-value {
  font-size: 1.3rem; font-weight: 800; font-family: 'Outfit', sans-serif;
}
.kpi-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

/* ── Tabs ────────────────────────────────────────── */
.analytics-tabs {
  display: flex; gap: 8px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}
.tab-btn {
  padding: 8px 20px; font-size: 0.875rem; font-weight: 600;
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn-active {
  color: var(--accent-secondary) !important;
  border-bottom-color: var(--accent-primary) !important;
}

/* ── Grid / Col layouts ─────────────────────────── */
.analytics-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; align-items: start;
}
.analytics-col { display: flex; flex-direction: column; gap: 20px; }

/* ── Card ────────────────────────────────────────── */
.analytics-card {
  padding: 24px; display: flex; flex-direction: column; gap: 4px;
}
.card-title { font-size: 1rem; font-weight: 700; }
.card-sub { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px; }

/* ── Weakness card ───────────────────────────────── */
.weakness-card { border-color: #f59e0b30 !important; }

/* ── Best session ────────────────────────────────── */
.best-session-info {
  display: flex; gap: 16px; align-items: center; margin-top: 8px;
}

/* ── Mini badge ──────────────────────────────────── */
.mini-badge {
  font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
  border-radius: 999px; background: #ffffff0a;
  color: var(--text-secondary); border: 1px solid #ffffff10;
}

/* ── Evaluation breakdown ────────────────────────── */
.eval-breakdown-list { display: flex; flex-direction: column; gap: 0; margin-top: 8px; }
.eval-breakdown-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0; border-bottom: 1px solid var(--border);
}
.eval-breakdown-row:last-child { border-bottom: none; }
.eval-num {
  font-size: 0.75rem; color: var(--text-muted);
  min-width: 24px; text-align: center;
}
.eval-info { flex: 1; min-width: 0; }
.eval-topic { font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eval-date { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
.eval-row-scores { display: flex; gap: 12px; }
.eval-mini-score { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.eval-mini-label { font-size: 0.65rem; color: var(--text-muted); }

/* ── Session full row ────────────────────────────── */
.session-full-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0; border-bottom: 1px solid var(--border);
}
.session-full-row:last-child { border-bottom: none; }
.session-mode-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.session-full-info { flex: 1; min-width: 0; }
.session-full-topic {
  font-size: 0.875rem; font-weight: 600; margin-bottom: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Empty state ─────────────────────────────────── */
.empty-state {
  align-items: center; text-align: center;
  padding: 60px 40px; color: var(--text-secondary);
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1200px) {
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1000px) {
  .analytics-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .analytics-main { padding: 20px; }
  .kpi-strip { grid-template-columns: 1fr 1fr; }
  .eval-row-scores { display: none; }
}
@media (max-width: 500px) {
  .kpi-strip { grid-template-columns: 1fr; }
}
`;
