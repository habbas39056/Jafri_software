import { supabase } from '@/lib/supabase';
import { ShieldCheck, Calendar, User, Search } from 'lucide-react';

export default async function WarrantyPage() {
  const { data: warrantiesData, error } = await supabase
    .from('Warranty')
    .select('*, customer:Customer(*), invoice:Invoice(*, items:InvoiceItem(*, product:Product(*)))')
    .order('end_date', { ascending: true });

  const warranties = (warrantiesData || []) as any[];


  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Warranty Tracking</h1>
          <p>Monitor product warranty status and expiration dates.</p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by product name, customer or invoice number..." 
            style={{ 
              width: '100%', 
              padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)',
              outline: 'none',
              fontSize: '0.875rem'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {warranties.length > 0 ? warranties.map((warranty) => {
          const isExpired = new Date(warranty.end_date) < new Date();
          return (
            <div key={warranty.id} className="card" style={{ borderLeft: `4px solid ${isExpired ? '#ef4444' : '#10b981'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{warranty.invoice?.items[0]?.product?.product_name || 'General Warranty'}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Inv: {warranty.invoice?.invoice_number || '-'}</p>
                </div>
                <div style={{ background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isExpired ? '#ef4444' : '#10b981', padding: '6px', borderRadius: '8px' }}>
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <User size={14} style={{ color: '#64748b' }} />
                  <span>{warranty.customer.customer_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span>Expires: {new Date(warranty.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${isExpired ? 'badge-pending' : 'badge-completed'}`} style={{ backgroundColor: isExpired ? '#fee2e2' : '#dcfce7', color: isExpired ? '#991b1b' : '#166534' }}>
                  {isExpired ? 'Expired' : 'Active'}
                </span>
                <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>Details</button>
              </div>
            </div>
          );
        }) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <ShieldCheck size={48} style={{ color: '#e2e8f0', marginBottom: '1rem' }} />
            <h3 style={{ color: '#64748b' }}>No warranty records found.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
