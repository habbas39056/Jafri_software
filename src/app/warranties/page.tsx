'use client';

import { useState, useEffect, use } from 'react';
import { Plus, Search, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import WarrantySearch from '@/components/WarrantySearch';
import { getWarranties, getCustomers, getInvoices, getChallans, getPurchaseOrders } from '@/lib/mockDb';

export default function WarrantiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = use(searchParams as Promise<{ q?: string }>);
  const query = resolvedSearchParams?.q || '';

  const [warranties, setWarranties] = useState<any[]>([]);

  useEffect(() => {
    const allWarranties = getWarranties();
    const allCustomers = getCustomers();
    const allInvoices = getInvoices();
    const allPOs = getPurchaseOrders();
    const allChallans = getChallans();

    let formatted = allWarranties.map(w => {
      const customer = allCustomers.find(c => c.id === w.customer_id) || { customer_name: 'Unknown' };
      const invoice = allInvoices.find(i => i.id === w.invoice_id) || null;
      const challan = allChallans.find(c => c.id === w.challan_id) || null;
      const po = invoice ? allPOs.find(p => p.id === invoice.po_id) : (challan ? allPOs.find(p => p.id === challan.po_id) : null);

      return {
        ...w,
        customer,
        invoice: invoice ? { ...invoice, po } : null,
        po,
        status: new Date(w.end_date) > new Date() ? 'Active' : 'Expired'
      };
    });

    if (query) {
      const q = query.toLowerCase();
      formatted = formatted.filter(w => 
        w.warranty_number.toLowerCase().includes(q) ||
        w.customer.customer_name.toLowerCase().includes(q) ||
        (w.po?.po_number || '').toLowerCase().includes(q)
      );
    }

    formatted.sort((a, b) => b.id - a.id);
    setWarranties(formatted);
  }, [query]);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Product Warranties</h1>
          <p>Manage and issue warranty certificates.</p>
        </div>
        <div className="header-actions">
          <Link href="/warranties/new" className="btn btn-primary">
            <Plus size={18} />
            Issue New Warranty
          </Link>
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Warranties</h3>
            <p>{warranties.filter(w => w.status === 'Active').length}</p>
          </div>
        </div>
      </div>

      <WarrantySearch />

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Warranty #</th>
                <th>Basis</th>
                <th>Customer</th>
                <th>PO Reference</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warranties.length > 0 ? warranties.map((warranty) => (
                <tr key={warranty.id}>
                  <td style={{ fontWeight: 600 }}>{warranty.warranty_number || `WR-${warranty.id}`}</td>
                  <td>
                    <span className={`badge badge-${(warranty.warranty_type || 'INV').toLowerCase()}`} style={{ 
                      backgroundColor: warranty.warranty_type === 'DC' ? '#ffedd5' : '#dbeafe',
                      color: warranty.warranty_type === 'DC' ? '#9a3412' : '#1e40af'
                    }}>
                      {warranty.warranty_type || 'INV'}
                    </span>
                  </td>
                  <td>{warranty.customer.customer_name}</td>
                  <td>{warranty.invoice?.po?.po_number || warranty.po?.po_number || '-'}</td>
                  <td>{new Date(warranty.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${warranty.status.toLowerCase()}`}>
                      {warranty.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/warranties/${warranty.id}`} className="btn" style={{ padding: '4px' }} title="View Certificate">
                        <ExternalLink size={18} />
                      </Link>
                      <Link href={`/warranties/${warranty.id}?download=true`} className="btn" style={{ padding: '4px' }} title="Download PDF">
                        <Download size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No warranties found.
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
