import { supabase } from '@/lib/supabase';
import { Plus, Wallet, ArrowDownRight, ArrowUpRight, Inbox } from 'lucide-react';
import Link from 'next/link';

export default async function CashbookPage() {
  const { data, error } = await supabase
    .from('Cashbook')
    .select('*')
    .order('date', { ascending: false });

  let transactions = (data || []) as any[];

  // ---------------------------------------------------------
  // DUMMY DATA INJECTION FOR VISUAL PREVIEW (Since DB is mocked)
  // ---------------------------------------------------------
  if (transactions.length === 0) {
    transactions = [
      { id: '1', date: '2026-06-01', description: 'Office Petty Cash Topup', category: 'Petty Cash', transaction_type: 'IN', amount: 50000, reference: 'TRX-9901' },
      { id: '2', date: '2026-06-02', description: 'KE Electricity Bill', category: 'Utility Bill', transaction_type: 'OUT', amount: 15500, reference: 'KE-112' },
      { id: '3', date: '2026-06-05', description: 'Office Supplies (Stationery)', category: 'Miscellaneous', transaction_type: 'OUT', amount: 3200, reference: 'RCPT-44' },
      { id: '4', date: '2026-06-08', description: 'Internet Bill (PTCL)', category: 'Utility Bill', transaction_type: 'OUT', amount: 5500, reference: 'PTCL-88' },
      { id: '5', date: '2026-06-10', description: 'Client Advance Payment', category: 'Bank Deposit', transaction_type: 'IN', amount: 100000, reference: 'CHK-123' },
      { id: '6', date: '2026-06-12', description: 'Tea and Refreshments', category: 'Petty Cash', transaction_type: 'OUT', amount: 1500, reference: 'RCPT-45' },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  // ---------------------------------------------------------

  let totalIn = 0;
  let totalOut = 0;

  // Calculate totals and running balances
  // To calculate running balance correctly, we should sort ascending first
  const sortedForBalance = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let currentBalance = 0;

  sortedForBalance.forEach(trx => {
    if (trx.transaction_type === 'IN') {
      currentBalance += trx.amount;
      totalIn += trx.amount;
    } else {
      currentBalance -= trx.amount;
      totalOut += trx.amount;
    }
    trx.running_balance = currentBalance;
  });

  // Re-sort descending for display
  transactions = sortedForBalance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Cashbook & Ledger</h1>
          <p>Track your petty cash, utility bills, and monthly expenses.</p>
        </div>
        <div className="header-actions">
          <Link href="/cashbook/new" className="btn btn-primary">
            <Plus size={18} />
            Record Transaction
          </Link>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          <strong>Database Error:</strong> {error.message}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="stats-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
              <ArrowDownRight size={26} strokeWidth={2.5} />
            </div>
          </div>
          <div className="stat-info" style={{ marginTop: '0.5rem' }}>
            <h3>Total Cash In</h3>
            <p>PKR {totalIn.toLocaleString()}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <ArrowUpRight size={26} strokeWidth={2.5} />
            </div>
          </div>
          <div className="stat-info" style={{ marginTop: '0.5rem' }}>
            <h3>Total Cash Out</h3>
            <p>PKR {totalOut.toLocaleString()}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Wallet size={26} strokeWidth={2.5} />
            </div>
          </div>
          <div className="stat-info" style={{ marginTop: '0.5rem' }}>
            <h3>Current Balance</h3>
            <p style={{ color: currentBalance < 0 ? 'var(--danger)' : 'var(--foreground)' }}>
              PKR {currentBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.2s', padding: 0 }}>
        <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Ledger Entries</h2>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius) var(--radius)', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Reference</th>
                <th>Debit (In)</th>
                <th>Credit (Out)</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((trx) => (
                <tr key={trx.id}>
                  <td style={{ color: '#64748b' }}>
                    {new Date(trx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 600 }}>{trx.description}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(226, 232, 240, 0.5)', color: '#475569', border: 'none' }}>
                      {trx.category}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{trx.reference || '-'}</td>
                  
                  {/* DEBIT / IN */}
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                    {trx.transaction_type === 'IN' ? `PKR ${trx.amount.toLocaleString()}` : '-'}
                  </td>
                  
                  {/* CREDIT / OUT */}
                  <td style={{ fontWeight: 600, color: 'var(--danger)' }}>
                    {trx.transaction_type === 'OUT' ? `PKR ${trx.amount.toLocaleString()}` : '-'}
                  </td>

                  {/* RUNNING BALANCE */}
                  <td style={{ fontWeight: 700 }}>
                    PKR {trx.running_balance.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Inbox size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                    <p style={{ color: '#64748b', fontWeight: 500 }}>No transactions recorded.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
