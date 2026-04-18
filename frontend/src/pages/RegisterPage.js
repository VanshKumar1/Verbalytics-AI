import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const GOAL_OPTIONS = ['debate', 'interview', 'public_speaking', 'critical_thinking'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, authError } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [goals, setGoals] = useState(['debate']);

  const [localError, setLocalError] = useState(null);

  const canSubmit = useMemo(
    () =>
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0,
    [username, email, password, firstName, lastName]
  );

  const toggleGoal = (goal) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await register({
        username,
        email,
        password,
        firstName,
        lastName,
        profile: { skillLevel, goals },
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-gray-50 to-white">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,theme(colors.primary.200),transparent_40%),radial-gradient(circle_at_90%_0%,theme(colors.secondary.200),transparent_45%),radial-gradient(circle_at_80%_80%,theme(colors.primary.100),transparent_40%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="card p-8 bg-white/80 backdrop-blur-sm border border-border shadow-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground mb-6">Start improving with debate and interview practice.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    className="input border-input"
                    placeholder="e.g. alex_01"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="input border-input"
                    placeholder="alex@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    className="input border-input"
                    placeholder="Alex"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    className="input border-input"
                    placeholder="Johnson"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="input border-input"
                  placeholder="StrongPass1"
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Skill level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="input border-input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`px-3 py-2 rounded-md border text-sm transition ${
                          goals.includes(goal)
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white/40 text-foreground border-border hover:bg-accent'
                        }`}
                      >
                        {goal.replaceAll('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
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
                    <Spinner /> Creating...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

