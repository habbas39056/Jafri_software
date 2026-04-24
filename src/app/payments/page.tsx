import { supabase } from '@/lib/supabase';
import { CreditCard, Plus, Search, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let payments: any[] = [];
  try {
    let supabaseQuery = supabase
      .from('Payment')
      .select('*, customer:Customer(*), invoice:Invoice(*)')
      .order('payment_date', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`payment_method.ilike.%${query}%,customer(customer_name).ilike.%${query}%,invoice(invoice_number).ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    payments = data || [];
  } catch (error) {
    console.error('Supabase error in PaymentsPage:', error);
  }

  const totalCollected = payments.reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Payment History</h1>
          <p>Track all incoming payments from customers.</p>
        </div>
        <div className="header-actions">
          <Link href="/payments/new" className="btn btn-primary">
            <Plus size={18} />
            Record Payment
          </Link>
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Collected</h3>
            <p>PKR {totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Transactions</h3>
            <p>{payments.length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="#64748b" />
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{payment.customer.customer_name}</td>
                  <td>
                    <Link href={`/invoices/${payment.invoice_id}`} className="nav-link" style={{ padding: 0, color: 'var(--primary)' }}>
                      {payment.invoice.invoice_number}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>PKR {payment.amount_paid.toLocaleString()}</td>
                  <td>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                      {payment.payment_method}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{payment.remarks || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
