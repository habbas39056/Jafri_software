'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function POSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', opacity: isPending ? 0.7 : 1 }}>
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search POs by number or customer name..." 
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
          style={{ 
            width: '100%', 
            padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            outline: 'none',
            fontSize: '0.875rem'
          }} 
        />
      </div>
    </div>
  );
}
