'use client';

import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/products/actions';
import { useTransition } from 'react';

export default function ProductActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        className="btn" 
        onClick={handleDelete}
        disabled={isPending}
        style={{ 
          padding: '4px', 
          color: 'var(--danger)', 
          border: '1px solid var(--border)', 
          background: 'white',
          opacity: isPending ? 0.5 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer'
        }}
        title="Delete Product"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
