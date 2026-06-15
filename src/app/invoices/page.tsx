'use client';

import { useState, useEffect, use } from 'react';
import { Plus, Search, FileText, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import InvoiceSearch from '@/components/InvoiceSearch';
import InvoiceActions from '@/components/InvoiceActions';
import { getInvoices, Invoice, getCustomers, Customer, getPurchaseOrders, PurchaseOrder } from '@/lib/mockDb';

export default function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; customer?: string; status?: string }> | { q?: string; customer?: string; status?: string };
}) {
  const resolvedSearchParams = searchParams instanceof Promise ? use(searchParams as Promise<any>) : searchParams;
  const query = resolvedSearchParams?.q || '';
  const customerId = resolvedSearchParams?.customer || '';
  const status = resolvedSearchParams?.status || '';

  const [invoices, setInvoices] = useState<(Invoice & { customer?: Customer; po?: PurchaseOrder })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allInvoices = getInvoices();
      const allCustomers = getCustomers();
      const allPos = getPurchaseOrders();
      setCustomers(allCustomers);

      let data = allInvoices.map(inv => ({
        ...inv,
        customer: allCustomers.find(c => c.id === inv.customer_id),
        po: allPos.find(p => p.id === inv.po_id)
      }));

      if (query) {
        const lowerQuery = query.toLowerCase();
        data = data.filter(inv => 
          inv.invoice_number.toLowerCase().includes(lowerQuery) ||
          inv.customer?.customer_name.toLowerCase().includes(lowerQuery) ||
          inv.po?.po_number.toLowerCase().includes(lowerQuery)
        );
      }

      if (customerId) {
        data = data.filter(inv => inv.customer_id.toString() === customerId);
      }

      if (status) {
        data = data.filter(inv => inv.status.toLowerCase() === status.toLowerCase());
      }

      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setInvoices(data);
    } catch (e: any) {
      setError(e.message || "Could not fetch from local storage.");
    }
  }, [query, customerId, status]);

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

      <InvoiceSearch customers={customers} />

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
            {!error && invoices.length > 0 ? invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ fontWeight: 600 }}>{invoice.invoice_number}</td>
                <td>{invoice.customer?.customer_name || 'Unknown'}</td>
                <td>{invoice.po?.po_number || 'Unknown'}</td>
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
