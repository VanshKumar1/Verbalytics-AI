import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, authError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const canSubmit = useMemo(() => identifier.trim().length > 0 && password.length > 0, [identifier, password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ identifier, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // authError already set in context, but keep local fallback for robustness.
      setLocalError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-gray-50 to-white">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,theme(colors.primary.200),transparent_40%),radial-gradient(circle_at_90%_0%,theme(colors.secondary.200),transparent_45%),radial-gradient(circle_at_80%_80%,theme(colors.primary.100),transparent_40%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="card p-8 bg-white/80 backdrop-blur-sm border border-border shadow-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground mb-6">Sign in to practice debates and interviews.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email or Username</label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  type="text"
                  className="input border-input"
                  placeholder="e.g. alex@example.com or alex_01"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="input border-input"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
              </div>

              {(authError || localError) && (
                <div className="rounded-md bg-error-50 border border-error-200 p-3 text-sm text-error-800">
                  {authError || localError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`btn btn-primary w-full ${(!canSubmit || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground flex justify-between">
              <Link to="/register" className="text-primary-600 hover:underline font-medium">
                Create account
              </Link>
              <button
                type="button"
                className="text-primary-600 hover:underline font-medium"
                onClick={() => alert('Password reset will be added in Step 2 follow-up (email flow).')}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

