import { supabase } from '@/lib/supabase';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import POSearch from '@/components/POSearch';
import POActions from '@/components/POActions';

export default async function POPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; customer?: string; status?: string }> | { q?: string; customer?: string; status?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';
  const customerId = resolvedSearchParams?.customer || '';
  const status = resolvedSearchParams?.status || '';

  let pos: any[] = [];
  let customers: any[] = [];
  
  try {
    // Fetch customers for filter dropdown
    const { data: customerData } = await supabase.from('Customer').select('id, customer_name').order('customer_name');
    customers = customerData || [];

    let supabaseQuery = supabase
      .from('PurchaseOrder')
      .select('*, customer:Customer(*), items:POItem(*, product:Product(*))')
      .order('created_at', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`po_number.ilike.%${query}%,customer(customer_name).ilike.%${query}%`);
    }

    if (customerId) {
      supabaseQuery = supabaseQuery.eq('customer_id', customerId);
    }

    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status);
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

      <POSearch customers={customers} />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Customer</th>
              <th>PO Date</th>
              <th>Items</th>
              <th>Codes</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pos.length > 0 ? pos.map((po) => (
              <tr key={po.id}>
                <td style={{ fontWeight: 600 }}>{po.po_number}</td>
                <td>{po.customer.customer_name}</td>
                <td>{po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {po.items.map((item: any, i: number) => (
                      <div key={i}>{item.product.product_name} x {item.quantity}</div>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
                    {po.items.map((item: any, i: number) => (
                      <div key={i}>{item.product.product_code}</div>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>
                    {po.due_date ? new Date(po.due_date).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge badge-${(po.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                    {po.status || 'Pending'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <POActions id={po.id} />
                    <Link href={`/purchase-orders/${po.id}`} className="btn btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No Purchase Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
