'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { deleteCustomerDb } from '@/lib/mockDb';
import { useState } from 'react';
import Link from 'next/link';

export default function CustomerActions({ id }: { id: number }) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setIsPending(true);
      try {
        deleteCustomerDb(id);
        window.location.reload(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete customer');
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link 
        href={`/customers/${id}/edit`}
        className="btn" 
        style={{ 
          padding: '4px 8px', 
          color: '#4f46e5', 
          border: '1px solid #e0e7ff', 
          background: '#f5f7ff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          textDecoration: 'none',
          borderRadius: '6px'
        }}
        title="Edit Customer"
      >
        <Edit3 size={16} />
      </Link>
      <button 
        className="btn" 
        onClick={handleDelete}
        disabled={isPending}
        style={{ 
          padding: '4px 8px', 
          color: 'var(--danger)', 
          border: '1px solid var(--border)', 
          background: 'white',
          opacity: isPending ? 0.5 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '6px'
        }}
        title="Delete Customer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
