'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { getCustomers, updateCustomerDb, Customer } from '@/lib/mockDb';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const customers = getCustomers();
    const found = customers.find(c => c.id === parseInt(resolvedParams.id, 10));
    if (found) {
      setCustomer(found);
    } else {
      setError('Customer not found');
    }
  }, [resolvedParams.id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const form = e.currentTarget;
    const customer_name = (form.elements.namedItem('customer_name') as HTMLInputElement).value;
    const address = (form.elements.namedItem('address') as HTMLTextAreaElement).value;
    const ntn = (form.elements.namedItem('ntn') as HTMLInputElement).value;
    const sales_tax_registration = (form.elements.namedItem('sales_tax_registration') as HTMLInputElement).value;
    const vendor_code = (form.elements.namedItem('vendor_code') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

    if (!customer_name || !vendor_code) {
      setError('Customer name and Vendor code are required');
      setIsPending(false);
      return;
    }

    try {
      updateCustomerDb(parseInt(resolvedParams.id, 10), {
        customer_name,
        address,
        ntn,
        sales_tax_registration,
        vendor_code,
        phone,
      });
      router.push('/customers');
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
      setIsPending(false);
    }
  };

  if (error && !customer) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{error}</h2>
        <Link href="/customers" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to Customers</Link>
      </div>
    );
  }

  if (!customer) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Edit Customer</h1>
          <p>Update client registration details.</p>
        </div>
        <div className="header-actions">
          <Link href="/customers" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="customer_name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Customer Name *</label>
              <input 
                type="text" 
                id="customer_name" 
                name="customer_name" 
                defaultValue={customer.customer_name}
                required 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="vendor_code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vendor Code *</label>
              <input 
                type="text" 
                id="vendor_code" 
                name="vendor_code" 
                defaultValue={customer.vendor_code}
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Phone / WhatsApp</label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                defaultValue={customer.phone}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="ntn" style={{ fontSize: '0.875rem', fontWeight: 600 }}>NTN (National Tax Number)</label>
              <input 
                type="text" 
                id="ntn" 
                name="ntn" 
                defaultValue={customer.ntn}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
            
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="sales_tax_registration" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sales Tax Registration (STRN)</label>
            <input 
              type="text" 
              id="sales_tax_registration" 
              name="sales_tax_registration" 
              defaultValue={customer.sales_tax_registration}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="address" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Address</label>
            <textarea 
              id="address" 
              name="address" 
              defaultValue={customer.address}
              rows={3}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              <Save size={18} />
              {isPending ? 'Updating...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
