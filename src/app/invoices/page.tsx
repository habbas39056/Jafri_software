import { supabase } from '@/lib/supabase';
import { Plus, Search, FileText, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import InvoiceSearch from '@/components/InvoiceSearch';
import InvoiceActions from '@/components/InvoiceActions';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let invoices: any[] = [];
  try {
    let supabaseQuery = supabase
      .from('Invoice')
      .select('*, customer:Customer(*), po:PurchaseOrder(*)')
      .order('invoice_date', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`invoice_number.ilike.%${query}%,customer(customer_name).ilike.%${query}%,po(po_number).ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    invoices = data || [];
  } catch (error) {
    console.error('Supabase error in InvoicesPage:', error);
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Invoices & Tax</h1>
          <p>Generate sales tax invoices and track billing status.</p>
        </div>
        <div className="header-actions">
          <Link href="/invoices/new" className="btn btn-primary">
            <Plus size={18} />
            New Invoice
          </Link>
        </div>
      </header>

      <InvoiceSearch />

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Invoiced</h3>
            <p>PKR {invoices.reduce((acc, inv) => acc + inv.total_amount, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>Paid Amount</h3>
            <p>PKR {invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.total_amount, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>PO Reference</th>
              <th>Date</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ fontWeight: 600 }}>{invoice.invoice_number}</td>
                <td>{invoice.customer.customer_name}</td>
                <td>{invoice.po.po_number}</td>
                <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                <td>PKR {invoice.subtotal.toLocaleString()}</td>
                <td>PKR {invoice.gst_amount.toLocaleString()}</td>
                <td style={{ fontWeight: 700 }}>PKR {invoice.total_amount.toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/invoices/${invoice.id}`} className="btn" style={{ padding: '4px' }} title="View Details">
                      <FileText size={18} />
                    </Link>
                    <Link href={`/invoices/${invoice.id}`} className="btn" style={{ padding: '4px' }} title="Print Invoice">
                      <Download size={18} />
                    </Link>
                    <InvoiceActions id={invoice.id} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
