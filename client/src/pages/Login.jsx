import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

// ── Real email validation ─────────────────────────────────────────────────────
// Blocks clearly fake/test/disposable domains
const BLOCKED_DOMAINS = [
  'test.com', 'example.com', 'fake.com', 'asdf.com', 'qwer.com', 'abc.com',
  'temp.com', 'temp-mail.org', 'mailinator.com', 'guerrillamail.com',
  'throwaway.email', 'yopmail.com', 'sharklasers.com', 'trashmail.com',
  'dispostable.com', 'spamgourmet.com', 'maildrop.cc', 'nada.email',
  'getnada.com', 'tempr.email', 'fakeinbox.com', 'spam4.me', 'aaa.com',
  'bbb.com', 'ccc.com', 'ddd.com', 'eee.com', 'fff.com', 'zzz.com',
  'xxx.com', 'yyy.com', 'abcd.com', 'abcde.com', 'nothing.com',
];

// Strong regex: must have valid chars, a real-looking domain and TLD ≥ 2 chars
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address (e.g. john@gmail.com)';

  const [localPart, domain] = trimmed.split('@');
  if (!domain) return 'Enter a valid email address';

  // Block disposable / obviously fake domains
  if (BLOCKED_DOMAINS.includes(domain)) return `"${domain}" is not accepted. Please use a real email address.`;

  // Block if local part looks like random keyboard smash (no vowels, all same char, too short)
  if (localPart.length < 2) return 'Email address seems too short';
  if (/^(.)\1+$/.test(localPart)) return 'Enter a real email address';

  return null; // valid
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Live email status as user types
  const liveEmailError = emailTouched ? validateEmail(form.email) : null;

  const validate = () => {
    const e = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleChange = (ev) => {
    setForm((p) => ({ ...p, [ev.target.name]: ev.target.value }));
    setErrors((p) => ({ ...p, [ev.target.name]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setEmailTouched(true);
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: form.email.trim(), password: form.password });
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Try again.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const emailErr = errors.email || liveEmailError;
  const emailOk = emailTouched && !liveEmailError && form.email.length > 0;

  return (
    <div className="auth-page bg-mesh">

      {/* ── Left Branding Panel ─────────────────────────────────────── */}
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="brand-logo animate-pulse-glow">
            <Zap size={32} color="#6c63ff" />
          </div>
          <h1 className="brand-title">
            Verbalytics<span className="gradient-text"> AI</span>
          </h1>
          <p className="brand-sub">
            Master the art of debate and interview through AI-powered practice.
          </p>
          <div className="brand-features">
            {[
              'Debate Mode — AI argues back',
              'Interview Simulation',
              'Real-time Evaluation',
              'Progress Analytics',
            ].map((f) => (
              <div key={f} className="brand-feature-item">
                <span className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* VANSH Signature */}
          <div className="jaat-badge">
            <span className="jaat-by">Built by</span>
            <span className="jaat-name">VANSH</span>
          </div>

          <div className="brand-orb brand-orb-1" />
          <div className="brand-orb brand-orb-2" />
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-card glass animate-fade-up">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your practice</p>
          </div>

          {errors.form && <div className="auth-error-banner"><AlertCircle size={14} /> {errors.form}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="login-email">Email Address</label>
              <div className="field-input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@gmail.com"
                  className={`input input-with-icon ${emailErr ? 'input-error' : emailOk ? 'input-success' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                />
                {emailOk && (
                  <div className="field-check-icon">
                    <ShieldCheck size={15} color="#10b981" />
                  </div>
                )}
              </div>
              {emailErr
                ? <span className="field-error"><AlertCircle size={11} /> {emailErr}</span>
                : emailOk && <span className="field-success">✓ Valid email address</span>
              }
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="field-input-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input input-with-icon input-with-action ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" className="field-eye-btn" onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="field-error"><AlertCircle size={11} /> {errors.password}</span>}
            </div>

            <button id="login-submit-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>

          {/* VANSH Footer Signature */}
          <div className="jaat-footer">
            <span>© 2026 Verbalytics AI</span>
            <span className="jaat-footer-dot">·</span>
            <span>Crafted by <strong className="gradient-text">VANSH</strong></span>
          </div>
        </div>
      </div>

      <style>{authStyles}</style>
    </div>
  );
}

const authStyles = `
/* ── Layout ───────────────────────────────────────── */
.auth-page { display: flex; min-height: 100vh; }

/* ── Left brand panel ─────────────────────────────── */
.auth-brand {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 60px; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0a0a14 0%, #0f0f22 50%, #10101e 100%);
}
.brand-inner { position: relative; z-index: 2; max-width: 420px; }
.brand-logo {
  width: 64px; height: 64px;
  background: #6c63ff18; border: 1px solid #6c63ff40; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 28px; box-shadow: 0 0 40px #6c63ff30;
}
.brand-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 14px; }
.brand-sub { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.75; margin-bottom: 36px; }
.brand-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; }
.brand-feature-item { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); font-size: 0.9rem; }
.feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); flex-shrink: 0; box-shadow: 0 0 8px #6c63ff; }
.brand-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.brand-orb-1 { width: 320px; height: 320px; background: #6c63ff18; top: -100px; right: -100px; }
.brand-orb-2 { width: 220px; height: 220px; background: #22d3ee10; bottom: 60px; left: -60px; }

/* ── VANSH badge on left panel ────────────────────── */
.jaat-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #6c63ff20, #22d3ee10);
  border: 1px solid #6c63ff35; border-radius: 999px;
  padding: 8px 18px;
}
.jaat-by { font-size: 0.78rem; color: var(--text-muted); }
.jaat-name {
  font-size: 1rem; font-weight: 800; letter-spacing: 0.08em;
  font-family: 'Outfit', sans-serif;
  background: linear-gradient(90deg, #6c63ff, #22d3ee, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Right form panel ─────────────────────────────── */
.auth-form-panel {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 40px 60px; background: var(--bg-base);
}
.auth-card { padding: 44px; width: 100%; max-width: 420px; }
.auth-header { margin-bottom: 32px; }
.auth-header h2 { font-size: 1.9rem; margin-bottom: 6px; }
.auth-header p { color: var(--text-secondary); font-size: 0.9rem; }

/* ── Error / Success banner ───────────────────────── */
.auth-error-banner {
  display: flex; align-items: center; gap: 8px;
  background: #f43f5e15; border: 1px solid #f43f5e40;
  color: #f43f5e; border-radius: 10px;
  padding: 12px 14px; font-size: 0.875rem; margin-bottom: 20px;
}
.auth-form { display: flex; flex-direction: column; gap: 20px; }

/* ── Fields ───────────────────────────────────────── */
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.825rem; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.04em; }
.field-input-wrap { position: relative; }
.field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.field-check-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); }
.input-with-icon { padding-left: 40px !important; }
.input-with-action { padding-right: 44px !important; }
.field-eye-btn {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;
  display: flex; align-items: center; transition: color 0.2s;
}
.field-eye-btn:hover { color: var(--text-primary); }
.input-error { border-color: #f43f5e60 !important; box-shadow: 0 0 0 2px #f43f5e15 !important; }
.input-success { border-color: #10b98150 !important; box-shadow: 0 0 0 2px #10b98112 !important; }
.field-error { font-size: 0.78rem; color: #f43f5e; display: flex; align-items: center; gap: 4px; }
.field-success { font-size: 0.78rem; color: #10b981; }

/* ── Submit ───────────────────────────────────────── */
.btn-full { width: 100%; padding: 13px; font-size: 0.95rem; margin-top: 6px; letter-spacing: 0.02em; }

/* ── Auth switch ──────────────────────────────────── */
.auth-switch { text-align: center; margin-top: 24px; font-size: 0.875rem; color: var(--text-secondary); }
.auth-link { color: var(--accent-secondary); font-weight: 600; text-decoration: none; }
.auth-link:hover { text-decoration: underline; }

/* ── VANSH footer signature ───────────────────────── */
.jaat-footer {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border);
  font-size: 0.75rem; color: var(--text-muted);
}
.jaat-footer-dot { opacity: 0.4; }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-brand { padding: 40px 24px; flex: unset; }
  .auth-form-panel { padding: 24px; }
  .auth-card { padding: 28px 20px; }
}
`;
