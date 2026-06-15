'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { deletePurchaseOrderDb } from '@/lib/mockDb';
import { useTransition } from 'react';
import Link from 'next/link';

export default function POActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this Purchase Order? This will also delete its items and production tracking records.')) {
      startTransition(() => {
        deletePurchaseOrderDb(id);
        window.location.reload();
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link 
        href={`/purchase-orders/${id}/edit`}
        className="btn" 
        style={{ 
          flex: 1,
          color: '#4f46e5', 
          border: '1px solid #e0e7ff', 
          background: '#f5f7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          textDecoration: 'none',
          borderRadius: '6px',
          padding: '4px 8px'
        }}
        title="Edit PO"
      >
        <Edit3 size={16} /> Edit
      </Link>
      <button 
        className="btn" 
        onClick={handleDelete}
        disabled={isPending}
        style={{ 
          flex: 1,
          color: 'var(--danger)', 
          border: '1px solid var(--border)', 
          background: 'white',
          opacity: isPending ? 0.5 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '6px',
          padding: '4px 8px'
        }}
        title="Delete PO"
      >
        <Trash2 size={16} /> Delete
      </button>
    </div>
  );
}
