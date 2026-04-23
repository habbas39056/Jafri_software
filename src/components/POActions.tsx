'use client';

import { Trash2 } from 'lucide-react';
import { deletePurchaseOrder } from '@/app/purchase-orders/actions';
import { useTransition } from 'react';

export default function POActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this Purchase Order? This will also delete its items and production tracking records.')) {
      startTransition(async () => {
        await deletePurchaseOrder(id);
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
        justifyContent: 'center'
      }}
      title="Delete PO"
    >
      <Trash2 size={16} style={{ marginRight: '4px' }}/> Delete
    </button>
  );
}
