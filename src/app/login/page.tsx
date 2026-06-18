'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory, LogIn } from 'lucide-react';

import { getEmployees, setActiveUser } from '@/lib/mockDb';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const email = emailInput.trim().toLowerCase();

    setTimeout(() => {
      const users = getEmployees();
      const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

      if (user) {
        setActiveUser(user);
        setLoading(false);
        router.push('/');
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  const inputStyle = {
    width: '100%', 
    padding: '0.85rem 1rem', 
    borderRadius: '10px', 
    border: '1px solid var(--border)', 
    background: 'rgba(255, 255, 255, 0.03)', 
    color: 'var(--foreground)',
    fontSize: '0.95rem',
    marginBottom: '1.25rem',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block', 
    marginBottom: '0.5rem', 
    fontWeight: 700, 
    fontSize: '0.8rem', 
    color: '#64748b', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em'
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', 
          color: 'white', 
          padding: '12px', 
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          marginBottom: '1rem'
        }}>
          <Factory size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontWeight: 800 }}>Welcome Back</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sign in to the Jafri & Co ERP System</p>
      </div>

      {/* Login Card */}
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        
        {error && (
          <div style={{ padding: '1rem', background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@company.com"
              required 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••"
              required 
              style={inputStyle} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', justifyContent: 'center' }}
          >
            {loading ? (
              <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
        <p>Protected by Enterprise Grade Security</p>
      </div>

      {/* Add a simple spin animation inline for the loading state */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}} />

    </div>
  );
}
