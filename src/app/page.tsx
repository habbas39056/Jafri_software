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

export default async function Dashboard() {
  const { data: invoicesData } = await supabase
    .from('Invoice')
    .select('*, payments:Payment(*)');
  
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

  const { data: recentOrdersData } = await supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*)')
    .order('created_at', { ascending: false })
    .limit(5);
    
  const recentOrders = (recentOrdersData || []) as any[];

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Welcome back, Jafri & Co Management System.</p>
        </div>
        <div className="header-actions">
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Purchase Orders</h2>
            <Link href="/purchase-orders" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.po_number}</td>
                    <td>{order.customer.customer_name}</td>
                    <td>{new Date(order.po_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Link href="/customers/new" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <ArrowRight size={16} /> Add New Customer
            </Link>
            <Link href="/purchase-orders/new" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <ArrowRight size={16} /> Create New PO
            </Link>
            <Link href="/delivery/new" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <ArrowRight size={16} /> Generate Challan
            </Link>
            <Link href="/invoices/new" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <ArrowRight size={16} /> Create Invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
