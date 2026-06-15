export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string; // 'Admin' | 'Employee'
  modules: string[];
}

export const initMockDb = () => {
  if (typeof window === 'undefined') return;

  const users = localStorage.getItem('jafri_users');
  if (!users) {
    const adminAccount: Employee = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jafri.com',
      password: 'admin',
      role: 'Admin',
      modules: []
    };
    localStorage.setItem('jafri_users', JSON.stringify([adminAccount]));
  }
};

export const getEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  initMockDb();
  const users = localStorage.getItem('jafri_users');
  return users ? JSON.parse(users) : [];
};

export const saveEmployee = (employee: Employee) => {
  if (typeof window === 'undefined') return;
  initMockDb();
  const users = getEmployees();
  users.push(employee);
  localStorage.setItem('jafri_users', JSON.stringify(users));
};

export const getActiveUser = (): Employee | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('jafri_active_user');
  return user ? JSON.parse(user) : null;
};

export const setActiveUser = (employee: Employee | null) => {
  if (typeof window === 'undefined') return;
  if (employee) {
    localStorage.setItem('jafri_active_user', JSON.stringify(employee));
  } else {
    localStorage.removeItem('jafri_active_user');
  }
};

export interface Customer {
  id: number;
  customer_name: string;
  address: string;
  ntn: string;
  sales_tax_registration: string;
  vendor_code: string;
  phone: string;
  created_at: string;
}

export const getCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_customers');
  return stored ? JSON.parse(stored) : [];
};

export const saveCustomer = (customer: Omit<Customer, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  customers.push(newCustomer);
  localStorage.setItem('jafri_customers', JSON.stringify(customers));
  return newCustomer;
};

export const updateCustomerDb = (id: number, customerUpdate: Partial<Omit<Customer, 'id' | 'created_at'>>) => {
  if (typeof window === 'undefined') return null;
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...customerUpdate };
    localStorage.setItem('jafri_customers', JSON.stringify(customers));
    return customers[index];
  }
  return null;
};

export const deleteCustomerDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const customers = getCustomers();
  localStorage.setItem('jafri_customers', JSON.stringify(customers.filter(c => c.id !== id)));
};

export interface POItem {
  id?: number;
  product_id: number;
  quantity: number;
  rate: number;
  total_amount: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  customer_id: number;
  po_date: string;
  due_date: string;
  status: string;
  gst_percentage: number;
  created_at: string;
  items?: POItem[];
}

export const getPurchaseOrders = (): PurchaseOrder[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_pos');
  return stored ? JSON.parse(stored) : [];
};

export const savePurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const pos = getPurchaseOrders();
  const newPO: PurchaseOrder = {
    ...po,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  pos.push(newPO);
  localStorage.setItem('jafri_pos', JSON.stringify(pos));
  return newPO;
};

export const updatePurchaseOrderDb = (id: number, poUpdate: Partial<Omit<PurchaseOrder, 'id' | 'created_at'>>) => {
  if (typeof window === 'undefined') return null;
  const pos = getPurchaseOrders();
  const index = pos.findIndex(p => p.id === id);
  if (index !== -1) {
    pos[index] = { ...pos[index], ...poUpdate };
    localStorage.setItem('jafri_pos', JSON.stringify(pos));
    return pos[index];
  }
  return null;
};

export const deletePurchaseOrderDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const pos = getPurchaseOrders();
  localStorage.setItem('jafri_pos', JSON.stringify(pos.filter(p => p.id !== id)));
};

export interface Product {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  unit_price: number;
  stock_quantity: number;
  image_url?: string;
  hs_code?: string;
  created_at: string;
}

export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_products');
  return stored ? JSON.parse(stored) : [];
};

export const saveProduct = (product: Omit<Product, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  products.push(newProduct);
  localStorage.setItem('jafri_products', JSON.stringify(products));
  return newProduct;
};

export const updateProductDb = (id: number, productUpdate: Partial<Omit<Product, 'id' | 'created_at'>>) => {
  if (typeof window === 'undefined') return null;
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...productUpdate };
    localStorage.setItem('jafri_products', JSON.stringify(products));
    return products[index];
  }
  return null;
};

export const deleteProductDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const products = getProducts();
  localStorage.setItem('jafri_products', JSON.stringify(products.filter(p => p.id !== id)));
};

export interface Invoice {
  id: number;
  invoice_number: string;
  po_id: number;
  customer_id: number;
  invoice_date: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export const getInvoices = (): Invoice[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_invoices');
  return stored ? JSON.parse(stored) : [];
};

export const saveInvoice = (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  invoices.push(newInvoice);
  localStorage.setItem('jafri_invoices', JSON.stringify(invoices));
  return newInvoice;
};

export const updateInvoiceDb = (id: number, invoiceUpdate: Partial<Omit<Invoice, 'id' | 'created_at'>>) => {
  if (typeof window === 'undefined') return null;
  const invoices = getInvoices();
  const index = invoices.findIndex(p => p.id === id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...invoiceUpdate };
    localStorage.setItem('jafri_invoices', JSON.stringify(invoices));
    return invoices[index];
  }
  return null;
};

export const deleteInvoiceDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const invoices = getInvoices();
  localStorage.setItem('jafri_invoices', JSON.stringify(invoices.filter(p => p.id !== id)));
};

export interface ChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  delivered_qty: number;
}

export interface Challan {
  id: number;
  gdn_number: string;
  po_id: number;
  customer_id: number;
  challan_date: string;
  status: string;
  created_at: string;
  items: ChallanItem[];
}

export const getChallans = (): Challan[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_challans');
  return stored ? JSON.parse(stored) : [];
};

export const saveChallan = (challan: Omit<Challan, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const challans = getChallans();
  const newChallan: Challan = {
    ...challan,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  challans.push(newChallan);
  localStorage.setItem('jafri_challans', JSON.stringify(challans));
  return newChallan;
};

export const updateChallanDb = (id: number, update: Partial<Omit<Challan, 'id' | 'created_at'>>) => {
  if (typeof window === 'undefined') return null;
  const challans = getChallans();
  const index = challans.findIndex(c => c.id === id);
  if (index !== -1) {
    challans[index] = { ...challans[index], ...update };
    localStorage.setItem('jafri_challans', JSON.stringify(challans));
    return challans[index];
  }
  return null;
};

export const deleteChallanDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const challans = getChallans();
  localStorage.setItem('jafri_challans', JSON.stringify(challans.filter(c => c.id !== id)));
};

export interface Payment {
  id: number;
  customer_id: number;
  invoice_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  remarks?: string;
  created_at: string;
}

export const getPayments = (): Payment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_payments');
  return stored ? JSON.parse(stored) : [];
};

export const savePayment = (payment: Omit<Payment, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  payments.push(newPayment);
  localStorage.setItem('jafri_payments', JSON.stringify(payments));
  return newPayment;
};

export const deletePaymentDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const payments = getPayments();
  localStorage.setItem('jafri_payments', JSON.stringify(payments.filter(p => p.id !== id)));
};

export interface CashbookEntry {
  id: number;
  date: string;
  description: string;
  category: string;
  transaction_type: string; // 'IN' or 'OUT'
  amount: number;
  reference?: string;
  created_at: string;
}

export const getCashbookEntries = (): CashbookEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_cashbook');
  return stored ? JSON.parse(stored) : [];
};

export const saveCashbookEntry = (entry: Omit<CashbookEntry, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const entries = getCashbookEntries();
  const newEntry: CashbookEntry = {
    ...entry,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  entries.push(newEntry);
  localStorage.setItem('jafri_cashbook', JSON.stringify(entries));
  return newEntry;
};

export const deleteCashbookEntryDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const entries = getCashbookEntries();
  localStorage.setItem('jafri_cashbook', JSON.stringify(entries.filter(e => e.id !== id)));
};

export interface Warranty {
  id: number;
  warranty_number: string;
  customer_id: number;
  invoice_id?: number;
  challan_id?: number;
  warranty_type: string;
  start_date: string;
  end_date: string;
  terms: string;
  created_at: string;
}

export const getWarranties = (): Warranty[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jafri_warranties');
  return stored ? JSON.parse(stored) : [];
};

export const saveWarranty = (warranty: Omit<Warranty, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return null;
  const warranties = getWarranties();
  const newWarranty: Warranty = {
    ...warranty,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  warranties.push(newWarranty);
  localStorage.setItem('jafri_warranties', JSON.stringify(warranties));
  return newWarranty;
};

export const deleteWarrantyDb = (id: number) => {
  if (typeof window === 'undefined') return;
  const warranties = getWarranties();
  localStorage.setItem('jafri_warranties', JSON.stringify(warranties.filter(w => w.id !== id)));
};
