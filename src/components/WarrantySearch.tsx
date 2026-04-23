'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function WarrantySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    startTransition(() => {
      router.push(`/warranties?${params.toString()}`);
    });
  };

  return (
    <div className="search-bar" style={{ maxWidth: '400px', marginBottom: '1.5rem', position: 'relative' }}>
      <Search 
        size={18} 
        style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#94a3b8' 
        }} 
      />
      <input
        type="text"
        placeholder="Search by Warranty #, Customer, or PO #..."
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => handleSearch(e.target.value)}
        className="input"
        style={{ paddingLeft: '40px', width: '100%' }}
      />
      {isPending && (
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#64748b' }}>
          Searching...
        </div>
      )}
    </div>
  );
}
