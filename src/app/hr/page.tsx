'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Calculator, Settings2, Play, CreditCard, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getEmployees, Employee } from '@/lib/mockDb';
import { 
  getHrConfigs, 
  saveHrConfig, 
  getEmployeeBalance, 
  addLedgerTransaction, 
  runSalaryEngine, 
  simulateSale,
  HrConfig,
  getLedgerTransactions,
  LedgerTransaction
} from '@/lib/mockHrDb';

function EmployeeCard({ 
  emp, 
  config, 
  balance, 
  empTxs, 
  isExpanded, 
  onToggleExpand, 
  onRefresh 
}: { 
  emp: Employee, 
  config: HrConfig, 
  balance: number, 
  empTxs: LedgerTransaction[], 
  isExpanded: boolean, 
  onToggleExpand: () => void,
  onRefresh: () => void 
}) {
  const [saveStatus, setSaveStatus] = useState('');
  const [txStatus, setTxStatus] = useState('');

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bs = Number(formData.get('baseSalary'));
    const cr = Number(formData.get('commissionRate'));
    const rd = Number(formData.get('renewalDay'));
    
    if (bs < 0 || cr < 0 || rd < 1 || rd > 31) {
      setSaveStatus('Error: Invalid values.');
      return;
    }
    
    saveHrConfig({
      employeeId: emp.id,
      baseSalary: bs,
      commissionRate: cr,
      renewalDay: rd,
      lastSalaryCreditDate: config.lastSalaryCreditDate
    });
    setSaveStatus('Structure saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
    onRefresh();
  };

  const handleAdjustmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const type = formData.get('adjType') as 'Advance' | 'Bonus' | 'Sale';
    const amountStr = formData.get('adjAmount') as string;
    const desc = formData.get('adjDesc') as string;

    if (!amountStr || isNaN(Number(amountStr))) {
      setTxStatus('Error: Invalid amount.');
      return;
    }

    if (!desc || !desc.trim()) {
      setTxStatus('Error: Description required.');
      return;
    }

    const inputAmt = Math.abs(Number(amountStr));
    
    let finalType: 'Advance' | 'Bonus' | 'Commission' = 'Bonus';
    let finalAmount = inputAmt;
    let finalDesc = desc;

    if (type === 'Sale') {
      finalType = 'Commission';
      finalAmount = (inputAmt * (config.commissionRate || 0)) / 100;
      finalDesc = `Sale of PKR ${inputAmt.toLocaleString()} - ${desc}`;
    } else if (type === 'Advance') {
      finalType = 'Advance';
      finalAmount = -inputAmt;
    }

    addLedgerTransaction({
      employeeId: emp.id,
      type: finalType,
      amount: finalAmount,
      description: finalDesc
    });

    form.reset();
    setTxStatus('Transaction logged successfully!');
    setTimeout(() => setTxStatus(''), 3000);
    onRefresh();
  };

  const handleRecordPayout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (balance <= 0) return;
    if (confirm(`Are you sure you want to record a payout of PKR ${balance.toFixed(2)}? This will zero out the ledger balance.`)) {
      addLedgerTransaction({
        employeeId: emp.id,
        type: 'Payout',
        amount: -balance,
        description: 'Monthly Payout / Balance Clearance'
      });
      onRefresh();
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header Row */}
      <div 
        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(37,99,235,0.02)' : 'transparent' }}
        onClick={onToggleExpand}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {emp.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{emp.name}</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>{emp.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Running Balance</p>
            <h2 style={{ margin: 0, color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              PKR {balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h2>
          </div>
          
          <button className="btn btn-primary" onClick={handleRecordPayout} disabled={balance <= 0}>
            <CreditCard size={16} /> Record Payout
          </button>
          <ChevronDown size={20} style={{ color: '#94a3b8', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* Expanded Settings & Adjustments */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: '#f8fafc' }}>
          
          {/* Column 1: Config */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Settings2 size={16} /> Compensation Structure</h4>
            <form onSubmit={handleSaveConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Base Salary (PKR)</label>
                  <input type="number" min="0" required name="baseSalary" defaultValue={config.baseSalary} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Auto-Renewal Day (1-31)</label>
                  <input type="number" min="1" max="31" required name="renewalDay" defaultValue={config.renewalDay || 1} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Commission Rate (%)</label>
                <input type="number" step="0.1" min="0" required name="commissionRate" defaultValue={config.commissionRate} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Save Structure</button>
              {saveStatus && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: saveStatus.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{saveStatus}</p>}
            </form>
          </div>

          {/* Column 2: Adjustments */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Calculator size={16} /> Log Transaction</h4>
            <form onSubmit={handleAdjustmentSubmit}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select name="adjType" defaultValue="Sale" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <option value="Sale">Sale (Auto-calculate Commission)</option>
                  <option value="Advance">Advance (Debit)</option>
                  <option value="Bonus">Bonus (Credit)</option>
                </select>
                <input type="number" name="adjAmount" min="1" placeholder="Amount (PKR)" required style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <input type="text" name="adjDesc" placeholder="Description (Required)" required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Log Transaction</button>
              {txStatus && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: txStatus.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{txStatus}</p>}
            </form>
          </div>

          {/* Column 3: Ledger History (Full Width) */}
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Recent Ledger Activity</h4>
            {empTxs.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No transactions recorded yet.</p>
            ) : (
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empTxs.slice(0, 10).map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                            background: tx.type === 'Salary' || tx.type === 'Bonus' || tx.type === 'Commission' ? 'var(--success-soft)' : 'var(--danger-soft)',
                            color: tx.type === 'Salary' || tx.type === 'Bonus' || tx.type === 'Commission' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{tx.description}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: tx.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.amount > 0 ? '+' : ''}PKR {Math.abs(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {empTxs.length > 10 && <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc' }}>Showing latest 10 transactions</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HrDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [configs, setConfigs] = useState<Record<string, HrConfig>>({});
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [refresh, setRefresh] = useState(0);

  // Modals / Expanded states
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null);

  const syncData = () => {
    const emps = getEmployees();
    setEmployees(emps);
    setConfigs(getHrConfigs());
    
    const newTxs = getLedgerTransactions();
    setTransactions(newTxs);
    
    const newBalances: Record<string, number> = {};
    emps.forEach(emp => {
      newBalances[emp.id] = getEmployeeBalance(emp.id);
    });
    setBalances(newBalances);
  };

  useEffect(() => {
    runSalaryEngine(); // Automatically check and renew salaries if the renewal day has passed
    syncData();
  }, [refresh]);

  const forceRefresh = () => {
    syncData();
    setRefresh(prev => prev + 1);
  };

  const handleRunEngine = () => {
    const count = runSalaryEngine();
    syncData();
    alert(`Engine Run Complete. Processed ${count} new monthly salary credits.`);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calculator className="text-primary" />
            HR Ledger Module
          </h1>
          <p style={{ color: '#64748b' }}>Unified employee ledger, commissions, and payouts.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handleRunEngine} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
            <Play size={16} /> Run Salary Engine
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>No Employees Found</h3>
          <p style={{ color: '#64748b' }}>Go to the Employees page to register staff members first.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {employees.map(emp => {
            const config = configs[emp.id] || { baseSalary: 0, commissionRate: 0, employeeId: emp.id };
            const balance = balances[emp.id] || 0;
            const empTxs = transactions.filter(t => t.employeeId === emp.id).reverse();
            const isExpanded = expandedEmpId === emp.id;

            return (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                config={config}
                balance={balance}
                empTxs={empTxs}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                onRefresh={forceRefresh}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
