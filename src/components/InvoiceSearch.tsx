'use client';

import { Search, Filter } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function InvoiceSearch({ customers }: { customers: any[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', opacity: isPending ? 0.7 : 1 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search invoices by number, customer or PO..." 
          onChange={(e) => updateParams('q', e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
          style={{ 
            width: '100%', 
            padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            outline: 'none',
            fontSize: '0.875rem',
            background: 'white'
          }} 
        />
      </div>

      <div style={{ position: 'relative', minWidth: '180px' }}>
        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <select
          onChange={(e) => updateParams('customer', e.target.value)}
          value={searchParams.get('customer') || ''}
          style={{ 
            width: '100%', 
            padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            outline: 'none',
            fontSize: '0.875rem',
            background: 'white',
            appearance: 'none'
          }}
        >
          <option value="">All Customers</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.customer_name}</option>
          ))}
        </select>
      </div>

      <div style={{ position: 'relative', minWidth: '180px' }}>
        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <select
          onChange={(e) => updateParams('status', e.target.value)}
          value={searchParams.get('status') || ''}
          style={{ 
            width: '100%', 
            padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            outline: 'none',
            fontSize: '0.875rem',
            background: 'white',
            appearance: 'none'
          }}
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
        </select>
      </div>
    </div>
  );
}
