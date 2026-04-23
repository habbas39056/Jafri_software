'use client';

import { createWarranty, getWarrantyInvoicables } from '../actions';
import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldPlus, Save } from 'lucide-react';

export default function NewWarrantyPage() {
  const [state, formAction, isPending] = useActionState(createWarranty, null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  useEffect(() => {
    getWarrantyInvoicables().then(setInvoices);
  }, []);

  const selectedInvoice = invoices.find(inv => inv.id.toString() === selectedInvoiceId);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Issue Warranty</h1>
          <p>Generate a warranty certificate for an existing invoice.</p>
        </div>
        <div className="header-actions">
          <Link href="/warranties" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form action={formAction} style={{ display: 'grid', gap: '1.5rem' }}>
          {state?.error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)' }}>
              {state.error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Invoice *</label>
            <select 
              name="invoice_id"
              required
              value={selectedInvoiceId}
              onChange={e => setSelectedInvoiceId(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">-- Select Paid/Invoiced Order --</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.customer.customer_name}</option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="animate-fade-in" style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>The warranty will be linked to:</p>
              <p style={{ fontWeight: 600 }}>PO Number: {selectedInvoice.po?.po_number || 'N/A'}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Products covered:</p>
                <ul style={{ fontSize: '0.875rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {selectedInvoice.items.map((item: any) => (
                    <li key={item.id}>{item.product.product_name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Warranty Duration *</label>
              <select 
                name="duration_years"
                required
                defaultValue="1"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Warranty Terms</label>
            <textarea 
              name="terms"
              rows={3}
              defaultValue="Standard 1 Year Warranty against manufacturing defects. Terms and conditions apply."
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending || !selectedInvoiceId} className="btn btn-primary">
              <ShieldPlus size={18} />
              {isPending ? 'Generating...' : 'Generate Warranty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
