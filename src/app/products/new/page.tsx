'use client';

import { createProduct } from '../actions';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useActionState } from 'react';

export default function NewProductPage() {
  const [state, formAction, isPending] = useActionState(createProduct, null);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Add New Product</h1>
          <p>Register a new product in your catalog.</p>
        </div>
        <div className="header-actions">
          <Link href="/products" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form action={formAction} style={{ display: 'grid', gap: '1.5rem' }}>
          {state?.error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              {state.error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="product_name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Product Name *</label>
            <input 
              type="text" 
              id="product_name" 
              name="product_name" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              placeholder="e.g. Industrial Valve A"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product_code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Product Code *</label>
              <input 
                type="text" 
                id="product_code" 
                name="product_code" 
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. P-001"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="unit_price" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Unit Price (PKR) *</label>
              <input 
                type="number" 
                id="unit_price" 
                name="unit_price" 
                min="0"
                step="0.01"
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. 1500"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              <Save size={18} />
              {isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
