import { 
  DollarSign, 
  Percent, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

import DashboardFilter from '@/components/DashboardFilter';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }> | { customer?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const customerId = resolvedSearchParams?.customer || '';

  // Fetch customers for filter
  const { data: customerData } = await supabase.from('Customer').select('id, customer_name').order('customer_name');
  const customers = customerData || [];

  let invoicesQuery = supabase
    .from('Invoice')
    .select('*, customer:Customer(*), payments:Payment(*)');
  
  if (customerId) {
    invoicesQuery = invoicesQuery.eq('customer_id', customerId);
  }

  const { data: invoicesData } = await invoicesQuery;
  const invoices = (invoicesData || []) as any[];

  const totalSales = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalGST = invoices.reduce((sum, inv) => sum + (inv.gst_amount || 0), 0);
  
  let totalPending = 0;
  let overdueCount = 0;
  const today = new Date();

  invoices.forEach(inv => {
    const payments = inv.payments || [];
    const received = payments.reduce((s: number, p: any) => s + (p.amount_paid || 0) + (p.wht_amount || 0) + (p.retained_amount || 0) + (p.ld_penalty || 0), 0);
    const balance = inv.total_amount - received;
    
    if (balance > 0) {
      totalPending += balance;
      const dueDate = new Date(inv.invoice_date);
      dueDate.setDate(dueDate.getDate() + 30);
      if (dueDate < today) {
        overdueCount++;
      }
    }
  });

  const stats = [
    { label: 'Total Sales', value: `PKR ${totalSales.toLocaleString()}`, icon: DollarSign, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    { label: 'GST Collected', value: `PKR ${totalGST.toLocaleString()}`, icon: Percent, color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
    { label: 'Pending Payments', value: `PKR ${totalPending.toLocaleString()}`, icon: Clock, color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
    { label: 'Overdue Invoices', value: overdueCount.toString(), icon: AlertCircle, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  ];

  let poQuery = supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*)')
    .order('created_at', { ascending: false });

  if (customerId) {
    poQuery = poQuery.eq('customer_id', customerId);
  }

  const { data: recentOrdersData } = await poQuery.limit(5);
  const recentOrders = (recentOrdersData || []) as any[];

  return (
    <div className="animate-fade-in">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Business Overview</h1>
          <p>Real-time analytics and management dashboard.</p>
        </div>
        <div className="header-actions" style={{ gap: '1rem' }}>
          <DashboardFilter customers={customers} />
          <button className="btn btn-primary">
            <TrendingUp size={18} />
            Generate Report
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.label}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Invoice Wise Breakup</h2>
            <Link href="/invoices" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              All Invoices <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Inv No</th>
                  {!customerId && <th>Customer</th>}
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.slice(0, 5).map((inv) => {
                  const received = (inv.payments || []).reduce((s: number, p: any) => s + (p.amount_paid || 0) + (p.wht_amount || 0) + (p.retained_amount || 0) + (p.ld_penalty || 0), 0);
                  const balance = inv.total_amount - received;
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                      {!customerId && <td>{inv.customer?.customer_name}</td>}
                      <td>PKR {inv.total_amount.toLocaleString()}</td>
                      <td style={{ color: balance > 0 ? '#ef4444' : '#059669', fontWeight: 600 }}>
                        PKR {balance.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge badge-${balance <= 0 ? 'paid' : 'pending'}`}>
                          {balance <= 0 ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Activity</h2>
            <Link href="/purchase-orders" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              All POs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>PO No</th>
                  {!customerId && <th>Customer</th>}
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.po_number}</td>
                    {!customerId && <td>{order.customer.customer_name}</td>}
                    <td>{new Date(order.po_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No recent activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
