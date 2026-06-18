'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { deleteChallanDb } from '@/lib/mockDb';
import { useTransition } from 'react';
import Link from 'next/link';

export default function ChallanActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this Delivery Note (GDN)? This will reset the delivered quantity in production tracking.')) {
      startTransition(() => {
        deleteChallanDb(id);
        window.location.reload();
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link 
        href={`/delivery/${id}/edit`}
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
        title="Edit GDN"
      >
        <Edit3 size={16} />
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          borderRadius: '6px',
          padding: '4px 8px'
        }}
        title="Delete GDN"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
