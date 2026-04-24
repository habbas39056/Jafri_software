'use client';

import { Trash2 } from 'lucide-react';
import { deleteChallan } from '@/app/delivery/actions';
import { useTransition } from 'react';

export default function ChallanActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this Delivery Note (GDN)? This will reset the delivered quantity in production tracking.')) {
      startTransition(async () => {
        const result = await deleteChallan(id);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
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
        gap: '4px'
      }}
      title="Delete GDN"
    >
      <Trash2 size={16} /> Delete
    </button>
  );
}
