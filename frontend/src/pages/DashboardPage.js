import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user, loading, authError, fetchProfile, logout } = useAuth();

  useEffect(() => {
    if (token && !user && !loading) fetchProfile();
  }, [token, user, loading, fetchProfile]);

  const welcomeName = useMemo(() => {
    const name = user?.firstName || user?.username || 'there';
    return String(name).trim();
  }, [user]);

  if (!token) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
              <span className="text-sm font-medium text-foreground">Ready for practice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4">
              Hi, {welcomeName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose a mode to start, then review evaluation feedback to improve your logic, clarity, and relevance.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => logout()}
            aria-label="Log out"
          >
            Log out
          </button>
        </div>

        {authError && (
          <div className="mt-6 rounded-md bg-error-50 border border-error-200 p-3 text-sm text-error-800">
            {authError}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-border shadow-sm animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your stats</h2>
                <p className="text-muted-foreground mt-1 text-sm">Based on saved evaluations</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Logic</span>
                <span className="font-semibold text-foreground">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Clarity</span>
                <span className="font-semibold text-foreground">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Relevance</span>
                <span className="font-semibold text-foreground">--</span>
              </div>
            </div>
            <div className="mt-5 text-xs text-muted-foreground">
              Charts and progress will be added in Step 9.
            </div>
          </div>

          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-border shadow-sm animate-fade-in [animation-delay:120ms]">
            <h2 className="text-lg font-semibold text-foreground">Debate Mode</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              The AI argues against your stance, builds counter-arguments, and asks follow-up questions.
            </p>
            <div className="mt-5">
              <Link
                to="/chat?mode=debate"
                className="btn btn-primary w-full justify-center"
              >
                Start debate
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-border shadow-sm animate-fade-in [animation-delay:180ms]">
            <h2 className="text-lg font-semibold text-foreground">Interview Mode</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              The AI interviewer asks one question at a time and adjusts difficulty as you improve.
            </p>
            <div className="mt-5">
              <Link
                to="/chat?mode=interview"
                className="btn btn-secondary w-full justify-center"
              >
                Start interview
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 card p-6 bg-white/80 backdrop-blur-sm border border-border shadow-sm animate-fade-in [animation-delay:240ms]">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Evaluation Mode</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Get structured scoring (Logic/Clarity/Relevance) and actionable improvements.
              </p>
            </div>
            <Link to="/chat?mode=evaluation" className="btn btn-success justify-center">
              Start evaluation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

