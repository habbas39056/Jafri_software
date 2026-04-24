'use client';

import { Trash2 } from 'lucide-react';
import { deleteInvoice } from '@/app/invoices/actions';
import { useTransition } from 'react';

export default function InvoiceActions({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice? This will also remove linked tax info and payment records.')) {
      startTransition(async () => {
        const result = await deleteInvoice(id);
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
        padding: '4px', 
        color: 'var(--danger)', 
        border: '1px solid var(--border)', 
        background: 'white',
        opacity: isPending ? 0.5 : 1,
        cursor: isPending ? 'not-allowed' : 'pointer'
      }}
      title="Delete Invoice"
    >
      <Trash2 size={18} />
    </button>
  );
}
