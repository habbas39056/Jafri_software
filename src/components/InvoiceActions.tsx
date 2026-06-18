'use client';

import { Trash2, Edit3, Send } from 'lucide-react';
import { deleteInvoiceDb } from '@/lib/mockDb';
import { useTransition } from 'react';
import Link from 'next/link';

export default function InvoiceActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      startTransition(() => {
        deleteInvoiceDb(id);
        window.location.reload();
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link 
        href={`/invoices/${id}/edit`}
        className="btn" 
        style={{ 
          padding: '4px 8px', 
          color: '#4f46e5', 
          border: '1px solid #e0e7ff', 
          background: '#f5f7ff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          textDecoration: 'none',
          borderRadius: '6px'
        }}
        title="Edit Invoice"
      >
        <Edit3 size={16} />
      </Link>
      <button 
        className="btn" 
        onClick={handleDelete}
        disabled={isPending}
        style={{ 
          padding: '4px 8px', 
          color: 'var(--danger)', 
          border: '1px solid var(--border)', 
          background: 'white',
          opacity: isPending ? 0.5 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '6px'
        }}
        title="Delete Invoice"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
