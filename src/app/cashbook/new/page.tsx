'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { saveCashbookEntry } from '@/lib/mockDb';

export default function NewCashbookEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const rawAmount = formData.get('amount') as string;
      const amount = parseFloat(rawAmount || '0');
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number.");
      }

      saveCashbookEntry({
        date: formData.get('date') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        transaction_type: formData.get('transaction_type') as string,
        amount: amount,
        reference: formData.get('reference') as string || undefined
      });

      router.push('/cashbook');
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="header">
        <div className="page-title">
          <h1>Record Transaction</h1>
          <p>Add a new petty cash, utility, or general expense entry.</p>
        </div>
        <div className="header-actions">
          <Link href="/cashbook" className="btn btn-secondary">
            <ArrowLeft size={18} />
            Back to Ledger
          </Link>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date</label>
            <input 
              type="date" 
              name="date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Transaction Type</label>
            <select 
              name="transaction_type" 
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }}
            >
              <option value="OUT">Money Out (Credit / Expense)</option>
              <option value="IN">Money In (Debit / Topup)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
            <select 
              name="category" 
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }}
            >
              <option value="Petty Cash">Petty Cash</option>
              <option value="Utility Bill">Utility Bill</option>
              <option value="Monthly Expense">Monthly Expense</option>
              <option value="Salary">Salary</option>
              <option value="Miscellaneous">Miscellaneous</option>
              <option value="Bank Deposit">Bank Deposit</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Amount (PKR)</label>
            <input 
              type="number" 
              name="amount" 
              step="0.01" 
              min="0.01"
              required 
              placeholder="e.g. 5000"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }} 
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
            <input 
              type="text" 
              name="description" 
              required 
              placeholder="e.g. KE Electricity Bill - May 2026"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }} 
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reference No (Optional)</label>
            <input 
              type="text" 
              name="reference" 
              placeholder="Receipt or Voucher No"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)' }} 
            />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
