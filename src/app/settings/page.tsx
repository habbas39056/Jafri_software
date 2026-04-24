import { Settings, Database, Key, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Settings</h1>
          <p>Manage system configuration and preferences.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '700px' }}>

        {/* Database Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Database size={22} />
            </div>
            <h2 style={{ fontSize: '1.1rem' }}>Database</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Provider</span>
              <span style={{ fontWeight: 600 }}>Supabase (PostgreSQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Status</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>● Connected</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '8px' }}>
              <Info size={22} />
            </div>
            <h2 style={{ fontSize: '1.1rem' }}>Application Info</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Software</span>
              <span style={{ fontWeight: 600 }}>Jafri ERP System</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Version</span>
              <span style={{ fontWeight: 600 }}>v1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Framework</span>
              <span style={{ fontWeight: 600 }}>Next.js 16 (App Router)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Company</span>
              <span style={{ fontWeight: 600 }}>Jafri & Co.</span>
            </div>
          </div>
        </div>

        {/* API Keys Notice */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '8px' }}>
              <Key size={22} />
            </div>
            <h2 style={{ fontSize: '1.1rem' }}>API Configuration</h2>
          </div>
          <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
            <strong>⚠ Sensitive Information:</strong> API keys and database credentials are managed via environment variables and are not displayed here for security reasons. Update them in your hosting platform (Vercel) environment settings.
          </div>
        </div>

      </div>
    </div>
  );
}
