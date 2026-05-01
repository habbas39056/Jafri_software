'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function ProductSearch() {
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
    <div style={{ marginBottom: '2.5rem', opacity: isPending ? 0.7 : 1 }}>
      <div style={{ position: 'relative', maxWidth: '500px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#1e293b' }} />
        <input 
          type="text" 
          placeholder="Search by name or code..." 
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
          style={{ 
            width: '100%', 
            padding: '1rem 1rem 1rem 3rem', 
            borderRadius: '12px', 
            border: '1.5px solid #e2e8f0',
            background: 'white',
            outline: 'none',
            fontSize: '1rem',
            color: '#1e293b',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }} 
        />
      </div>
    </div>
  );
}
