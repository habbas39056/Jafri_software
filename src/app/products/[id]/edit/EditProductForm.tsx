'use client';

import { updateProduct } from '../../actions';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useActionState, useState } from 'react';

export default function EditProductForm({ product }: { product: any }) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateProductWithId, null);
  const [preview, setPreview] = useState<string | null>(product.image_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          <h1>Edit Product</h1>
          <p>Update details for {product.product_name}</p>
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

          <input type="hidden" name="existing_image_url" value={product.image_url || ''} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="product_name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Product Name *</label>
            <input 
              type="text" 
              id="product_name" 
              name="product_name" 
              defaultValue={product.product_name}
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="product_code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Product Code *</label>
              <input 
                type="text" 
                id="product_code" 
                name="product_code" 
                defaultValue={product.product_code}
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="unit_price" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Unit Price (PKR) *</label>
              <input 
                type="number" 
                id="unit_price" 
                name="unit_price" 
                defaultValue={product.unit_price}
                min="0"
                step="0.01"
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
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
                defaultValue={product.hs_code || ''}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
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
                    <p style={{ fontSize: '0.875rem' }}>Click to select new image</p>
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
              {isPending ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
