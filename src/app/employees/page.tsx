'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, UserCog, Inbox } from 'lucide-react';
import { addEmployee } from './actions';
import { getEmployees, saveEmployee, Employee } from '@/lib/mockDb';

export default function EmployeeManagementPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // We still call the server action just to simulate it, though it does nothing real
    const result = await addEmployee(formData);

    if (result.success) {
      const modules: string[] = [];
      if (formData.get('mod_dashboard')) modules.push('Dashboard');
      if (formData.get('mod_invoices')) modules.push('Invoices');
      if (formData.get('mod_customers')) modules.push('Customers');
      if (formData.get('mod_products')) modules.push('Products');
      if (formData.get('mod_cashbook')) modules.push('Cashbook');
      if (formData.get('mod_reports')) modules.push('Reports');
      if (formData.get('mod_purchase_orders')) modules.push('Purchase Orders');
      if (formData.get('mod_production')) modules.push('Production');
      if (formData.get('mod_delivery')) modules.push('Delivery');
      if (formData.get('mod_payments')) modules.push('Payments');
      if (formData.get('mod_warranty')) modules.push('Warranty');

      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        modules: modules
      };

      // Save to local storage
      saveEmployee(newEmployee);
      // Update UI state
      setEmployees(getEmployees());
      
      form.reset();
      setLoading(false);
    } else {
      setError(result.error || 'Failed to create employee');
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', 
    padding: '0.6rem 0.8rem', 
    borderRadius: '10px', 
    border: '1px solid var(--border)', 
    background: 'transparent', 
    color: 'var(--foreground)',
    fontSize: '0.9rem'
  };

  const labelStyle = {
    display: 'block', 
    marginBottom: '0.4rem', 
    fontWeight: 700, 
    fontSize: '0.75rem', 
    color: '#64748b', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em'
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header className="header" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: 'none' }}>
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCog size={28} />
            Employee Management
          </h1>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* TOP CARD: CREATION FORM */}
      <div className="card animate-slide-up" style={{ marginBottom: '2rem', animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit}>
          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input type="text" name="name" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password *</label>
              <input type="password" name="password" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select name="role" required style={inputStyle}>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Modules Access */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Modules Access</label>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1.5rem', 
              padding: '1.25rem 1.5rem', 
              background: 'rgba(248, 250, 252, 0.4)', 
              borderRadius: '12px',
              border: '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_dashboard" defaultChecked style={{ width: '16px', height: '16px' }} /> DASHBOARD
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_invoices" style={{ width: '16px', height: '16px' }} /> INVOICES
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_customers" style={{ width: '16px', height: '16px' }} /> CUSTOMERS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_products" style={{ width: '16px', height: '16px' }} /> PRODUCTS (INVENTORY)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_cashbook" style={{ width: '16px', height: '16px' }} /> CASHBOOK (EXPENSE)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_reports" style={{ width: '16px', height: '16px' }} /> REPORTS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_purchase_orders" style={{ width: '16px', height: '16px' }} /> PURCHASE ORDERS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_production" style={{ width: '16px', height: '16px' }} /> PRODUCTION
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_delivery" style={{ width: '16px', height: '16px' }} /> DELIVERY
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_payments" style={{ width: '16px', height: '16px' }} /> PAYMENTS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="mod_warranty" style={{ width: '16px', height: '16px' }} /> WARRANTY
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Plus size={18} />
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
      </div>

      {/* BOTTOM CARD: EXISTING EMPLOYEES */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.2s', padding: 0 }}>
        <div style={{ padding: '2rem 2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Existing Employees</h2>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius) var(--radius)', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Access</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: emp.role === 'Admin' ? 'var(--primary-soft)' : 'rgba(226, 232, 240, 0.5)', color: emp.role === 'Admin' ? 'var(--primary)' : '#475569', border: 'none' }}>
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {emp.modules.map(mod => (
                        <span key={mod} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', fontWeight: 600 }}>
                          {mod}
                        </span>
                      ))}
                      {emp.modules.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Inbox size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                    <p style={{ color: '#64748b', fontWeight: 500 }}>No employees found.</p>
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
