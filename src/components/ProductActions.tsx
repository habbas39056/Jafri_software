'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { deleteProductDb } from '@/lib/mockDb';
import { useTransition } from 'react';
import Link from 'next/link';

export default function ProductActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(() => {
        deleteProductDb(id);
        window.location.reload();
      });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      <Link 
        href={`/products/${id}/edit`}
        className="btn" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.625rem', 
          color: '#4f46e5', 
          border: '1px solid #e0e7ff', 
          background: '#f5f7ff',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          borderRadius: '10px',
          textDecoration: 'none'
        }}
      >
        <Edit3 size={16} />
      </Link>

      <button 
        className="btn" 
        onClick={handleDelete}
        disabled={isPending}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.625rem', 
          color: '#ef4444', 
          border: '1px solid #fee2e2', 
          background: '#fff5f5',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: isPending ? 'not-allowed' : 'pointer',
          borderRadius: '10px',
          opacity: isPending ? 0.5 : 1
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
