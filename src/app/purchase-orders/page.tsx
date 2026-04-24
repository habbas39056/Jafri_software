import { supabase } from '@/lib/supabase';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import POSearch from '@/components/POSearch';
import POActions from '@/components/POActions';

export default async function POPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let pos: any[] = [];
  try {
    let supabaseQuery = supabase
      .from('PurchaseOrder')
      .select('*, customer:Customer(*), items:POItem(*, product:Product(*))')
      .order('created_at', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`po_number.ilike.%${query}%,customer(customer_name).ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    pos = data || [];
  } catch (error) {
    console.error('Supabase error in POPage:', error);
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Purchase Orders</h1>
          <p>Create and track customer purchase orders.</p>
        </div>
        <div className="header-actions">
          <Link href="/purchase-orders/new" className="btn btn-primary">
            <Plus size={18} />
            New PO
          </Link>
        </div>
      </header>

      <POSearch />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {pos.length > 0 ? pos.map((po) => (
          <div key={po.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{po.po_number}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                  <User size={14} /> {po.customer.customer_name}
                </div>
              </div>
              <span className={`badge badge-${(po.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                {po.status || 'Pending'}
              </span>
            </div>
 
            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Date:</span>
                <span>{po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Due Date:</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{po.due_date ? new Date(po.due_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Items</p>
              {po.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{item.product.product_name} x {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>PKR {item.total_amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <POActions id={po.id} />
              <Link href={`/purchase-orders/${po.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                View Details
              </Link>
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: '#64748b' }}>No Purchase Orders found.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
