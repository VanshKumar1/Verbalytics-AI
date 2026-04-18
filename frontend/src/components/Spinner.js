import React from 'react';

export default function Spinner({ className = '' }) {
  return <div className={`spinner ${className}`} aria-label="Loading" />;
}

