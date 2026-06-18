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

  const [salaryForm, setSalaryForm] = useState({
    monthlySalary: config.baseSalary || 0,
    workingDays: 30,
    workingHours: 8,
    leaveDays: 0,
    advances: 0,
    personalLoan: 0,
    overtimeHours: 0,
    extraWork: 0
  });

  const dailyRate = salaryForm.monthlySalary / (salaryForm.workingDays || 30);
  const hourlyRate = dailyRate / (salaryForm.workingHours || 8);
  
  const calculatedLeaveDeduction = Math.round(salaryForm.leaveDays * dailyRate);
  const calculatedOvertime = Math.round(salaryForm.overtimeHours * hourlyRate);

  useEffect(() => {
    setSalaryForm(prev => ({ ...prev, monthlySalary: config.baseSalary || 0 }));
  }, [config.baseSalary]);

  const amountPaid = salaryForm.monthlySalary 
    - calculatedLeaveDeduction 
    - salaryForm.advances 
    - salaryForm.personalLoan 
    + calculatedOvertime 
    + salaryForm.extraWork;

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

  const handleProcessSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Process salary and payout PKR ${amountPaid.toLocaleString()}? This will record all deductions and additions.`)) {
      // 1. Record Base Salary
      addLedgerTransaction({
        employeeId: emp.id,
        type: 'Salary',
        amount: salaryForm.monthlySalary,
        description: `Monthly Salary`
      });
      
      // 2. Deductions
      if (calculatedLeaveDeduction > 0) addLedgerTransaction({ employeeId: emp.id, type: 'Leave Deduction', amount: -calculatedLeaveDeduction, description: `Leaves Deduction (${salaryForm.leaveDays} days @ ${dailyRate.toFixed(0)}/day)` });
      if (salaryForm.advances > 0) addLedgerTransaction({ employeeId: emp.id, type: 'Advance', amount: -salaryForm.advances, description: 'Advance Recovery' });
      if (salaryForm.personalLoan > 0) addLedgerTransaction({ employeeId: emp.id, type: 'Loan Deduction', amount: -salaryForm.personalLoan, description: 'Personal Loan Installment' });
      
      // 3. Additions
      if (calculatedOvertime > 0) addLedgerTransaction({ employeeId: emp.id, type: 'Overtime', amount: calculatedOvertime, description: `Overtime Pay (${salaryForm.overtimeHours} hours @ ${hourlyRate.toFixed(0)}/hr)` });
      if (salaryForm.extraWork > 0) addLedgerTransaction({ employeeId: emp.id, type: 'Extra Work', amount: salaryForm.extraWork, description: 'Extra Work Pay' });

      // 4. Record Payout
      if (amountPaid > 0) {
        addLedgerTransaction({
          employeeId: emp.id,
          type: 'Payout',
          amount: -amountPaid,
          description: 'Salary Payout'
        });
      }

      setTxStatus('Salary processed successfully!');
      setTimeout(() => setTxStatus(''), 3000);
      onRefresh();
      
      // Reset form fields except monthly salary and working days
      setSalaryForm(prev => ({
        ...prev,
        leaveDays: 0,
        advances: 0,
        personalLoan: 0,
        overtimeHours: 0,
        extraWork: 0
      }));
    }
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

          {/* Full Width Salary Calculator */}
          <div style={{ gridColumn: '1 / -1', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '0.5rem' }}>
              <DollarSign size={18} /> Process Salary Statement
            </h4>
            
            <form onSubmit={handleProcessSalary}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                
                {/* Column A: Base & Deductions */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600, color: '#334155' }}>Monthly Salary</label>
                      <input 
                        type="number" min="0" required 
                        value={salaryForm.monthlySalary} 
                        onChange={e => setSalaryForm({...salaryForm, monthlySalary: Number(e.target.value)})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600, color: '#334155' }}>Working Days</label>
                      <input 
                        type="number" min="1" required 
                        value={salaryForm.workingDays} 
                        onChange={e => setSalaryForm({...salaryForm, workingDays: Number(e.target.value)})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600, color: '#334155' }}>Hours/Day</label>
                      <input 
                        type="number" min="1" required 
                        value={salaryForm.workingHours} 
                        onChange={e => setSalaryForm({...salaryForm, workingHours: Number(e.target.value)})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600 }} 
                      />
                    </div>
                  </div>

                  <h5 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Less (Deductions)</h5>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={{ width: '120px', fontSize: '0.85rem', color: '#64748b' }}>Leaves Taken</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                      <input type="number" step="0.5" min="0" value={salaryForm.leaveDays || ''} onChange={e => setSalaryForm({...salaryForm, leaveDays: Number(e.target.value)})} placeholder="Days (e.g. 2)" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                        - PKR {calculatedLeaveDeduction.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={{ width: '120px', fontSize: '0.85rem', color: '#64748b' }}>Advances</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                      <input type="number" min="0" value={salaryForm.advances || ''} onChange={e => setSalaryForm({...salaryForm, advances: Number(e.target.value)})} placeholder="Amount" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                        - PKR {(salaryForm.advances || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={{ width: '120px', fontSize: '0.85rem', color: '#64748b' }}>Personal Loan</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                      <input type="number" min="0" value={salaryForm.personalLoan || ''} onChange={e => setSalaryForm({...salaryForm, personalLoan: Number(e.target.value)})} placeholder="Amount" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                        - PKR {(salaryForm.personalLoan || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column B: Additions & Total */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h5 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add (Earnings)</h5>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={{ width: '120px', fontSize: '0.85rem', color: '#64748b' }}>Overtime Hours</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                      <input type="number" step="0.5" min="0" value={salaryForm.overtimeHours || ''} onChange={e => setSalaryForm({...salaryForm, overtimeHours: Number(e.target.value)})} placeholder="Hours" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                        + PKR {calculatedOvertime.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <label style={{ width: '120px', fontSize: '0.85rem', color: '#64748b' }}>Extra Work</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                      <input type="number" min="0" value={salaryForm.extraWork || ''} onChange={e => setSalaryForm({...salaryForm, extraWork: Number(e.target.value)})} placeholder="Amount" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                        + PKR {(salaryForm.extraWork || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginTop: 'auto' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount Paid</p>
                    <h2 style={{ margin: '0.5rem 0 1rem 0', color: amountPaid >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '2rem' }}>
                      PKR {amountPaid.toLocaleString()}
                    </h2>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                      <CheckCircle2 size={18} /> Process & Pay
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Ledger History (Full Width) */}
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
