'use client';

import { markAsPaid } from '@/app/invoices/actions';
import { CheckCircle } from 'lucide-react';
import { useTransition } from 'react';

export default function InvoiceStatusActions({ id, status }: { id: number, status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status === 'Paid') return null;

  return (
    <button 
      className="btn" 
      disabled={isPending}
      onClick={() => {
        if (confirm('Mark this invoice as Paid?')) {
          startTransition(async () => {
            await markAsPaid(id);
          });
        }
      }}
      style={{ background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)' }}
    >
      <CheckCircle size={18} />
      {isPending ? 'Updating...' : 'Mark as Paid'}
    </button>
  );
}
