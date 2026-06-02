export interface HrConfig {
  employeeId: string;
  baseSalary: number;
  commissionRate: number; // e.g., 5 for 5%
  lastSalaryCreditDate?: string; // ISO Date String
  renewalDay?: number; // 1-31
}

export type TransactionType = 'Salary' | 'Commission' | 'Advance' | 'Bonus' | 'Payout';

export interface LedgerTransaction {
  id: string;
  employeeId: string;
  type: TransactionType;
  amount: number; // Positive = Owed to employee (Credit). Negative = Deducted/Paid (Debit)
  timestamp: string; // ISO Date String
  description: string;
}

const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getHrConfigs = (): Record<string, HrConfig> => {
  const data = getStorage<Record<string, HrConfig>>('jafri_hr_configs', {});
  return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
};

export const saveHrConfig = (config: HrConfig) => {
  const configs = getHrConfigs();
  configs[config.employeeId] = config;
  setStorage('jafri_hr_configs', configs);
};

export const getLedgerTransactions = (): LedgerTransaction[] => {
  const data = getStorage<LedgerTransaction[]>('jafri_hr_ledger', []);
  return Array.isArray(data) ? data : [];
};

export const addLedgerTransaction = (tx: Omit<LedgerTransaction, 'id' | 'timestamp'>) => {
  const txs = getLedgerTransactions();
  const newTx: LedgerTransaction = {
    ...tx,
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  txs.push(newTx);
  setStorage('jafri_hr_ledger', txs);
};

export const getEmployeeBalance = (employeeId: string): number => {
  const txs = getLedgerTransactions().filter(t => t.employeeId === employeeId);
  return txs.reduce((sum, t) => sum + t.amount, 0);
};

// ==========================================
// BACKGROUND ENGINE SIMULATOR
// ==========================================

export const runSalaryEngine = () => {
  const configs = getHrConfigs();
  const now = new Date();
  let executed = 0;

  Object.values(configs).forEach(config => {
    if (!config.baseSalary || config.baseSalary <= 0) return;

    const renewalDay = config.renewalDay || 1;
    
    // Only process if today is on or past the renewal day
    if (now.getDate() < renewalDay) {
      return; 
    }

    // Check if salary was credited this month
    const lastCredit = config.lastSalaryCreditDate ? new Date(config.lastSalaryCreditDate) : null;
    
    // If no last credit, or last credit was in a previous month/year
    if (!lastCredit || lastCredit.getMonth() !== now.getMonth() || lastCredit.getFullYear() !== now.getFullYear()) {
      // Credit salary
      addLedgerTransaction({
        employeeId: config.employeeId,
        type: 'Salary',
        amount: config.baseSalary,
        description: `Base Salary for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`
      });

      // Update config
      config.lastSalaryCreditDate = now.toISOString();
      saveHrConfig(config);
      executed++;
    }
  });

  return executed;
};

export const simulateSale = (orderValue: number) => {
  const configs = getHrConfigs();
  const activeConfigs = Object.values(configs).filter(c => c.commissionRate > 0);
  
  if (activeConfigs.length === 0) return null;

  // Randomly attribute the order to an employee who has a commission rate
  const randomConfig = activeConfigs[Math.floor(Math.random() * activeConfigs.length)];
  const commissionAmount = (orderValue * randomConfig.commissionRate) / 100;

  addLedgerTransaction({
    employeeId: randomConfig.employeeId,
    type: 'Commission',
    amount: commissionAmount,
    description: `Commission on Sale #${Math.floor(Math.random() * 10000)} (Value: $${orderValue.toFixed(2)})`
  });

  return {
    employeeId: randomConfig.employeeId,
    amount: commissionAmount
  };
};
