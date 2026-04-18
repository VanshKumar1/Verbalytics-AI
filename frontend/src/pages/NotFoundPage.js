import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50/50 via-white to-white p-6">
      <div className="card p-8 bg-white/80 backdrop-blur-sm border border-border shadow-sm animate-fade-in text-center max-w-md w-full">
        <div className="text-5xl mb-3">404</div>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground mt-2">The link you followed does not exist.</p>
        <div className="mt-6">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

