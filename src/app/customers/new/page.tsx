'use client';

import { createCustomer } from '../actions';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useActionState } from 'react';

// Use the old useFormState signature if useActionState isn't available in this React version
// but since we are using React 19 / Next 15 (App Router), useActionState is preferred.
// If it fails, we will fallback to a simple form submission.

export default function NewCustomerPage() {
  const [state, formAction, isPending] = useActionState(createCustomer, null);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Add New Customer</h1>
          <p>Register a new client in the system.</p>
        </div>
        <div className="header-actions">
          <Link href="/customers" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form action={formAction} style={{ display: 'grid', gap: '1.5rem' }}>
          {state?.error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              {state.error}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="customer_name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Customer Name *</label>
              <input 
                type="text" 
                id="customer_name" 
                name="customer_name" 
                required 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. ABC Corp"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="vendor_code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vendor Code *</label>
              <input 
                type="text" 
                id="vendor_code" 
                name="vendor_code" 
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. V-001"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Phone / WhatsApp</label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. +92 300 1234567"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="ntn" style={{ fontSize: '0.875rem', fontWeight: 600 }}>NTN (National Tax Number)</label>
              <input 
                type="text" 
                id="ntn" 
                name="ntn" 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. 1234567-8"
              />
            </div>
          </div>
            
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="sales_tax_registration" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sales Tax Registration (STRN)</label>
            <input 
              type="text" 
              id="sales_tax_registration" 
              name="sales_tax_registration" 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              placeholder="e.g. STRN-987654"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="address" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Address</label>
            <textarea 
              id="address" 
              name="address" 
              rows={3}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
              placeholder="Full business address"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              <Save size={18} />
              {isPending ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
