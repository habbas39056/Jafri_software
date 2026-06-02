import { 
  DollarSign, 
  Percent, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Inbox
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
  let invoices = (invoicesData || []) as any[];

  let poQuery = supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*)')
    .order('created_at', { ascending: false });

  if (customerId) {
    poQuery = poQuery.eq('customer_id', customerId);
  }

  const { data: recentOrdersData } = await poQuery.limit(5);
  let recentOrders = (recentOrdersData || []) as any[];

  // ---------------------------------------------------------
  // DUMMY DATA INJECTION FOR VISUAL PREVIEW (Since DB is mocked)
  // ---------------------------------------------------------
  if (invoices.length === 0) {
    invoices = [
      { id: '1', invoice_number: 'INV-2026-1041', customer: { customer_name: 'Acme Corp' }, total_amount: 125000, gst_amount: 22500, invoice_date: '2026-05-10', payments: [{ amount_paid: 125000 }] },
      { id: '2', invoice_number: 'INV-2026-1042', customer: { customer_name: 'Stark Industries' }, total_amount: 450000, gst_amount: 81000, invoice_date: '2026-05-15', payments: [{ amount_paid: 200000 }] },
      { id: '3', invoice_number: 'INV-2026-1043', customer: { customer_name: 'Wayne Enterprises' }, total_amount: 75000, gst_amount: 13500, invoice_date: '2026-05-20', payments: [] },
      { id: '4', invoice_number: 'INV-2026-1044', customer: { customer_name: 'Globex Corp' }, total_amount: 320000, gst_amount: 57600, invoice_date: '2026-05-22', payments: [] },
      { id: '5', invoice_number: 'INV-2026-1045', customer: { customer_name: 'Soylent Corp' }, total_amount: 95000, gst_amount: 17100, invoice_date: '2026-01-10', payments: [] }, // Overdue
    ];
  }

  if (recentOrders.length === 0) {
    recentOrders = [
      { id: '1', po_number: 'PO-2026-9021', customer: { customer_name: 'Acme Corp' }, po_date: '2026-06-01', status: 'Pending' },
      { id: '2', po_number: 'PO-2026-9022', customer: { customer_name: 'Stark Industries' }, po_date: '2026-05-28', status: 'Processing' },
      { id: '3', po_number: 'PO-2026-9023', customer: { customer_name: 'Wayne Enterprises' }, po_date: '2026-05-25', status: 'Delivered' },
      { id: '4', po_number: 'PO-2026-9024', customer: { customer_name: 'Globex Corp' }, po_date: '2026-05-24', status: 'Cancelled' },
    ];
  }
  // ---------------------------------------------------------

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
    { label: 'Total Sales', value: `PKR ${totalSales.toLocaleString()}`, trend: '+14% this month', icon: DollarSign, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' },
    { label: 'GST Collected', value: `PKR ${totalGST.toLocaleString()}`, trend: '+8% this month', icon: Percent, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
    { label: 'Pending Payments', value: `PKR ${totalPending.toLocaleString()}`, trend: 'Action needed', icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Overdue Invoices', value: overdueCount.toString(), trend: 'Requires attention', icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  ];

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>
            Business Overview
            <Sparkles size={24} style={{ display: 'inline-block', marginLeft: '12px', color: 'var(--warning)', verticalAlign: 'middle' }} />
          </h1>
          <p>Real-time analytics and financial pulse of your operations.</p>
        </div>
        <div className="header-actions">
          <DashboardFilter customers={customers} />
          <button className="btn btn-primary">
            <TrendingUp size={18} />
            Generate Report
          </button>
        </div>
      </header>

      <div className="stats-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {stats.map((stat, i) => (
          <div key={stat.label} className="card stat-card" style={{ animationDelay: `${0.1 * i}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stat.color, backgroundColor: stat.bg, padding: '4px 10px', borderRadius: '12px' }}>
                {stat.trend}
              </span>
            </div>
            <div className="stat-info" style={{ marginTop: '0.5rem' }}>
              <h3>{stat.label}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* INVOICE BREAKUP CARD */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.2s', padding: 0 }}>
          <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Invoice Wise Breakup</h2>
            <Link href="/invoices" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              All Invoices <ArrowRight size={16} />
            </Link>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius) var(--radius)', boxShadow: 'none' }}>
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
                  const percentPaid = inv.total_amount > 0 ? (received / inv.total_amount) * 100 : 0;
                  
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.invoice_number}</td>
                      {!customerId && <td style={{ fontWeight: 500 }}>{inv.customer?.customer_name}</td>}
                      <td>
                        PKR {inv.total_amount.toLocaleString()}
                        <div className="progress-bar-container">
                           <div className="progress-bar-fill" style={{ width: `${percentPaid}%` }} />
                        </div>
                      </td>
                      <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                        PKR {balance.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge badge-${balance <= 0 ? 'paid' : 'unpaid'}`}>
                          {balance <= 0 ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                      <Inbox size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                      <p style={{ color: '#64748b', fontWeight: 500 }}>No invoices found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ACTIVITY CARD */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.3s', padding: 0 }}>
          <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Recent Activity</h2>
            <Link href="/purchase-orders" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              All POs <ArrowRight size={16} />
            </Link>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius) var(--radius)', boxShadow: 'none' }}>
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
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.po_number}</td>
                    {!customerId && <td style={{ fontWeight: 500 }}>{order.customer.customer_name}</td>}
                    <td style={{ color: '#64748b' }}>{new Date(order.po_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                      <Inbox size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                      <p style={{ color: '#64748b', fontWeight: 500 }}>No recent activity.</p>
                    </td>
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
