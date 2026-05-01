import { supabase } from '@/lib/supabase';
import { Factory, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import UpdateProductionBtn from '@/components/UpdateProductionBtn';
import ProductionSearch from '@/components/ProductionSearch';

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; customer?: string; status?: string }> | { q?: string; customer?: string; status?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';
  const customerId = resolvedSearchParams?.customer || '';
  const status = resolvedSearchParams?.status || '';

  // Fetch customers for filter
  const { data: customerData } = await supabase.from('Customer').select('id, customer_name').order('customer_name');
  const customers = customerData || [];

  let supabaseQuery = supabase
    .from('ProductionTracking')
    .select('*, po:PurchaseOrder(*, customer:Customer(*)), product:Product(*)')
    .order('last_updated', { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.or(`po(po_number).ilike.%${query}%,product(product_name).ilike.%${query}%`);
  }

  if (customerId) {
    supabaseQuery = supabaseQuery.eq('po.customer_id', customerId);
  }

  if (status) {
    supabaseQuery = supabaseQuery.eq('status', status);
  }

  const { data: trackingData, error } = await supabaseQuery;
  const tracking = (trackingData || []) as any[];

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Production Tracking</h1>
          <p>Monitor manufacturing progress and pending quantities.</p>
        </div>
      </header>

      <ProductionSearch customers={customers} />

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending Production</h3>
            <p>{tracking.reduce((acc, t) => acc + t.pending_qty, 0)} Units</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>Delivered</h3>
            <p>{tracking.reduce((acc, t) => acc + t.delivered_qty, 0)} Units</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p>{tracking.reduce((acc, t) => acc + t.rejected_qty, 0)} Units</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr style={{ background: '#4472c4', color: 'white' }}>
              <th style={{ color: 'white', padding: '10px' }}>CUSTOMER</th>
              <th style={{ color: 'white', padding: '10px' }}>PO NO.</th>
              <th style={{ color: 'white', padding: '10px' }}>PROD/SERVICE</th>
              <th style={{ color: 'white', padding: '10px' }}>CODE</th>
              <th style={{ color: 'white', padding: '10px' }}>QTY</th>
              <th style={{ color: 'white', padding: '10px' }}>PO Dt</th>
              <th style={{ color: 'white', padding: '10px' }}>DUE Dt</th>
              <th style={{ color: 'white', padding: '10px' }}>DLVRED</th>
              <th style={{ color: 'white', padding: '10px' }}>REJCTD</th>
              <th style={{ color: 'white', padding: '10px' }}>PENDING</th>
              <th style={{ color: 'white', padding: '10px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {tracking.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.po.customer.customer_name}</td>
                <td style={{ color: '#000080', fontWeight: 600 }}>{item.po.po_number}</td>
                <td>{item.product.product_name}</td>
                <td>{item.product.product_code}</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.ordered_qty}</td>
                <td>{new Date(item.po.po_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                <td>{new Date(item.po.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>{item.delivered_qty}</td>
                <td style={{ color: 'var(--danger)', textAlign: 'center' }}>{item.rejected_qty}</td>
                <td style={{ color: 'var(--primary)', fontWeight: 700, textAlign: 'center' }}>{item.pending_qty}</td>
                <td style={{ textAlign: 'center' }}>
                  <UpdateProductionBtn tracking={{
                    id: item.id,
                    ordered_qty: item.ordered_qty,
                    delivered_qty: item.delivered_qty,
                    rejected_qty: item.rejected_qty,
                    product_name: item.product.product_name,
                    po_number: item.po.po_number
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
