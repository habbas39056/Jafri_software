import { prisma } from '@/lib/prisma';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      payments: true
    }
  });

  // Computed data for the summary table
  const summary = invoices.map(inv => {
    const received = inv.payments.reduce((acc, p) => acc + p.amount_paid, 0);
    const balance = inv.total_amount - received;
    const dueDate = new Date(inv.invoice_date);
    dueDate.setDate(dueDate.getDate() + 30); // Assume 30 days terms
    
    const overdueDays = Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      invoice_number: inv.invoice_number,
      customer_name: inv.customer.customer_name,
      amount: inv.subtotal,
      gst: inv.gst_amount,
      total: inv.total_amount,
      received,
      balance,
      due_date: dueDate,
      overdue_days: overdueDays,
      status: balance <= 0 ? 'Paid' : (overdueDays > 0 ? 'Overdue' : 'Pending')
    };
  });

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Financial Summary</h1>
          <p>Comprehensive overview of receivables and aging reports.</p>
        </div>
        <div className="header-actions">
          <Link href="/reports/ar-summary" className="btn btn-primary">
            <FileText size={18} />
            Full AR Summary Report
          </Link>
        </div>
      </header>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Receivables</h3>
            <p>PKR {summary.reduce((acc, s) => acc + s.total, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Received</h3>
            <p>PKR {summary.reduce((acc, s) => acc + s.received, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <p>PKR {summary.reduce((acc, s) => acc + s.balance, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Aging Summary</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>GST</th>
                <th>Total</th>
                <th>Received</th>
                <th style={{ color: '#ef4444' }}>Balance</th>
                <th>Due Date</th>
                <th>Overdue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.length > 0 ? summary.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{s.invoice_number}</td>
                  <td>{s.customer_name}</td>
                  <td>{s.amount.toLocaleString()}</td>
                  <td>{s.gst.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{s.total.toLocaleString()}</td>
                  <td style={{ color: 'var(--success)' }}>{s.received.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: s.balance > 0 ? '#ef4444' : 'inherit' }}>{s.balance.toLocaleString()}</td>
                  <td>{s.due_date.toLocaleDateString()}</td>
                  <td style={{ color: s.overdue_days > 0 ? '#ef4444' : 'inherit' }}>
                    {s.overdue_days > 0 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> {s.overdue_days} Days
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'Paid' ? 'badge-completed' : (s.status === 'Overdue' ? 'badge-pending' : 'badge-progress')}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No data available for reporting.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
