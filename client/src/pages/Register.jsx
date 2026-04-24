import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

// ── Real email validation ─────────────────────────────────────────────────────
const BLOCKED_DOMAINS = [
  'test.com', 'example.com', 'fake.com', 'asdf.com', 'qwer.com', 'abc.com',
  'temp.com', 'temp-mail.org', 'mailinator.com', 'guerrillamail.com',
  'throwaway.email', 'yopmail.com', 'sharklasers.com', 'trashmail.com',
  'dispostable.com', 'spamgourmet.com', 'maildrop.cc', 'nada.email',
  'getnada.com', 'tempr.email', 'fakeinbox.com', 'spam4.me', 'aaa.com',
  'bbb.com', 'ccc.com', 'ddd.com', 'eee.com', 'fff.com', 'zzz.com',
  'xxx.com', 'yyy.com', 'abcd.com', 'abcde.com', 'nothing.com',
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address (e.g. john@gmail.com)';

  const [localPart, domain] = trimmed.split('@');
  if (!domain) return 'Enter a valid email address';
  if (BLOCKED_DOMAINS.includes(domain)) return `"${domain}" is not accepted. Please use a real email address.`;
  if (localPart.length < 2) return 'Email address is too short';
  if (/^(.)\1+$/.test(localPart)) return 'Enter a real email address';

  return null;
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Live email status
  const liveEmailError = emailTouched ? validateEmail(form.email) : null;
  const emailOk = emailTouched && !liveEmailError && form.email.length > 0;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters required';

    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';

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
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.user, data.token);
      toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Try again.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'][strength];

  const emailErr = errors.email || liveEmailError;

  return (
    <div className="auth-page bg-mesh">

      {/* ── Left Branding Panel ─────────────────────────────── */}
      <div className="auth-brand">
        <div className="brand-inner">
          <div className="brand-logo animate-pulse-glow">
            <Zap size={32} color="#6c63ff" />
          </div>
          <h1 className="brand-title">
            Start Your<br />
            <span className="gradient-text">AI Journey</span>
          </h1>
          <p className="brand-sub">
            Join thousands of students and professionals who sharpen their debate and interview skills with Verbalytics AI.
          </p>

          <div className="reg-stats">
            {[['10K+', 'Active Users'], ['98%', 'Satisfaction Rate'], ['500K+', 'Sessions Done']].map(([num, lbl]) => (
              <div key={lbl} className="reg-stat">
                <span className="reg-stat-num gradient-text">{num}</span>
                <span className="reg-stat-lbl">{lbl}</span>
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

      {/* ── Right Form Panel ────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-card glass animate-fade-up">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Free forever — no credit card required</p>
          </div>

          {errors.form && (
            <div className="auth-error-banner">
              <AlertCircle size={14} /> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Full Name */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-name">Full Name</label>
              <div className="field-input-wrap">
                <User size={16} className="field-icon" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Arjun Singh"
                  className={`input input-with-icon ${errors.name ? 'input-error' : ''}`}
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <span className="field-error"><AlertCircle size={11} /> {errors.name}</span>}
            </div>

            {/* Email — strict real validation */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-email">Email Address</label>
              <div className="field-input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  id="reg-email"
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
              {!emailErr && !emailOk && (
                <span className="field-hint">Use a real email — you'll need it to recover your account</span>
              )}
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-password">Password</label>
              <div className="field-input-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className={`input input-with-icon input-with-action ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" className="field-eye-btn" onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="strength-bar-wrap">
                  <div className="strength-bar">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="strength-seg" style={{ background: n <= strength ? strengthColor : '#ffffff10' }} />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <span className="field-error"><AlertCircle size={11} /> {errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="field-input-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  id="reg-confirm"
                  name="confirm"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`input input-with-icon ${errors.confirm ? 'input-error' : form.confirm && form.confirm === form.password ? 'input-success' : ''}`}
                  value={form.confirm}
                  onChange={handleChange}
                />
                {form.confirm && form.confirm === form.password && (
                  <div className="field-check-icon"><ShieldCheck size={15} color="#10b981" /></div>
                )}
              </div>
              {errors.confirm && <span className="field-error"><AlertCircle size={11} /> {errors.confirm}</span>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Create Free Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>

          {/* VANSH Footer */}
          <div className="jaat-footer">
            <span>© 2026 Verbalytics AI</span>
            <span className="jaat-footer-dot">·</span>
            <span>Crafted by <strong className="gradient-text">VANSH</strong></span>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; min-height: 100vh; }
        .auth-brand {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 60px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0a0a14 0%, #0f0f22 50%, #10101e 100%);
        }
        .brand-inner { position: relative; z-index: 2; max-width: 420px; }
        .brand-logo {
          width: 64px; height: 64px; background: #6c63ff18;
          border: 1px solid #6c63ff40; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px; box-shadow: 0 0 40px #6c63ff30;
        }
        .brand-title { font-size: 2.4rem; font-weight: 800; margin-bottom: 14px; line-height: 1.2; }
        .brand-sub { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.75; margin-bottom: 36px; }
        .reg-stats { display: flex; gap: 28px; margin-bottom: 40px; }
        .reg-stat { display: flex; flex-direction: column; gap: 2px; }
        .reg-stat-num { font-size: 1.6rem; font-weight: 800; font-family: 'Outfit', sans-serif; }
        .reg-stat-lbl { font-size: 0.78rem; color: var(--text-muted); }
        .brand-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .brand-orb-1 { width: 320px; height: 320px; background: #6c63ff18; top: -100px; right: -100px; }
        .brand-orb-2 { width: 220px; height: 220px; background: #22d3ee10; bottom: 60px; left: -60px; }

        /* VANSH badge */
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

        /* Right panel */
        .auth-form-panel {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 60px; background: var(--bg-base);
        }
        .auth-card { padding: 44px; width: 100%; max-width: 440px; }
        .auth-header { margin-bottom: 28px; }
        .auth-header h2 { font-size: 1.9rem; margin-bottom: 6px; }
        .auth-header p { color: var(--text-secondary); font-size: 0.875rem; }
        .auth-error-banner {
          display: flex; align-items: center; gap: 8px;
          background: #f43f5e15; border: 1px solid #f43f5e40;
          color: #f43f5e; border-radius: 10px; padding: 12px 14px;
          font-size: 0.875rem; margin-bottom: 20px;
        }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }

        /* Fields */
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
        .field-hint { font-size: 0.75rem; color: var(--text-muted); }

        /* Strength */
        .strength-bar-wrap { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .strength-bar { display: flex; gap: 4px; flex: 1; }
        .strength-seg { flex: 1; height: 4px; border-radius: 999px; transition: background 0.3s; }
        .strength-label { font-size: 0.75rem; font-weight: 600; min-width: 70px; }

        .btn-full { width: 100%; padding: 13px; font-size: 0.95rem; margin-top: 4px; }
        .auth-switch { text-align: center; margin-top: 24px; font-size: 0.875rem; color: var(--text-secondary); }
        .auth-link { color: var(--accent-secondary); font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }

        /* VANSH footer */
        .jaat-footer {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border);
          font-size: 0.75rem; color: var(--text-muted);
        }
        .jaat-footer-dot { opacity: 0.4; }

        @media (max-width: 768px) {
          .auth-page { flex-direction: column; }
          .auth-brand { padding: 40px 24px; flex: unset; }
          .auth-form-panel { padding: 24px; }
          .auth-card { padding: 28px 20px; }
        }
      `}</style>
    </div>
  );
}
