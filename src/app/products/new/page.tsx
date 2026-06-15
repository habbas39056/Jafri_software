'use client';

import { saveProduct } from '@/lib/mockDb';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const form = e.currentTarget;
    const product_name = (form.elements.namedItem('product_name') as HTMLInputElement).value;
    const product_code = (form.elements.namedItem('product_code') as HTMLInputElement).value;
    const unit_price = parseFloat((form.elements.namedItem('unit_price') as HTMLInputElement).value);
    const hs_code = (form.elements.namedItem('hs_code') as HTMLInputElement).value;

    try {
      saveProduct({
        product_name,
        product_code,
        category: 'General',
        unit_price,
        stock_quantity: 0,
        // @ts-ignore (we aren't defining hs_code or image_url in Product mock schema fully but JS accepts it)
        hs_code,
        image_url: preview || ''
      });
      router.push('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
      setIsPending(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    const input = document.getElementById('image') as HTMLInputElement;
    if (input) input.value = '';
  };

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
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              {error}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="hs_code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>HS Code</label>
              <input 
                type="text" 
                id="hs_code" 
                name="hs_code" 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                placeholder="e.g. 8481.80"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="image" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Product Image</label>
              <div style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: 'var(--radius)', 
                padding: '1rem', 
                textAlign: 'center',
                position: 'relative',
                background: preview ? '#f8fafc' : 'transparent'
              }}>
                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={preview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                    />
                    <button 
                      type="button"
                      onClick={clearPreview}
                      style={{ 
                        position: 'absolute', 
                        top: '-10px', 
                        right: '-10px', 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#64748b' }}>
                    <Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.875rem' }}>Click to select or drag and drop</p>
                    <p style={{ fontSize: '0.75rem' }}>PNG, JPG or WebP (max. 2MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="image" 
                  name="image" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0, 
                    cursor: 'pointer',
                    width: '100%'
                  }}
                />
              </div>
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
