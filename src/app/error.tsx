'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('BHCMS Application Error:', error);
  }, [error]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--danger-color)', marginBottom: '1rem' }}>Something went wrong!</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px' }}>
        An unexpected error occurred in the application. We've logged the details and will look into it.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          Go back home
        </Link>
      </div>
      {error.digest && (
        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
