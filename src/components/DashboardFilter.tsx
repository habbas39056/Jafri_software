'use client';

import { Filter } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function DashboardFilter({ customers }: { customers: any[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCustomerChange = (customerId: string) => {
    const params = new URLSearchParams(searchParams);
    if (customerId) {
      params.set('customer', customerId);
    } else {
      params.delete('customer');
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div style={{ position: 'relative', minWidth: '240px', opacity: isPending ? 0.7 : 1 }}>
      <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      <select
        onChange={(e) => handleCustomerChange(e.target.value)}
        value={searchParams.get('customer') || ''}
        style={{ 
          width: '100%', 
          padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--border)',
          outline: 'none',
          fontSize: '0.875rem',
          background: 'white',
          appearance: 'none',
          fontWeight: 600,
          color: '#1e293b',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <option value="">All Customers (Global View)</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>{c.customer_name}</option>
        ))}
      </select>
    </div>
  );
}
