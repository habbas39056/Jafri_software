'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getInvoices, getCustomers, getPayments, savePayment, updateInvoiceDb } from '@/lib/mockDb';

export default function NewPaymentPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allInvoices = getInvoices();
    const allCustomers = getCustomers();
    
    const unpaid = allInvoices
      .filter(inv => inv.status !== 'Paid')
      .map(inv => ({
        ...inv,
        customer: allCustomers.find(c => c.id === inv.customer_id) || { customer_name: 'Unknown' }
      }))
      .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());
      
    setInvoices(unpaid);
  }, []);

  const selectedInvoice = invoices.find(inv => inv.id.toString() === selectedInvoiceId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const invoice_id_str = formData.get('invoice_id') as string;
      const amount_paid_str = formData.get('amount_paid') as string;
      const payment_method = formData.get('payment_method') as string;
      const payment_date = formData.get('payment_date') as string;
      const remarks = formData.get('remarks') as string;

      if (!invoice_id_str || !amount_paid_str || !payment_method || !payment_date) {
        throw new Error('Please fill in all required fields.');
      }

      const invoice_id = parseInt(invoice_id_str);
      const amount_paid = parseFloat(amount_paid_str);

      if (!selectedInvoice) throw new Error('Invoice not found.');

      const allPayments = getPayments();
      const invoicePayments = allPayments.filter(p => p.invoice_id === invoice_id);
      const totalPaidSoFar = invoicePayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const newTotalPaid = totalPaidSoFar + amount_paid;

      savePayment({
        invoice_id,
        customer_id: selectedInvoice.customer_id,
        amount_paid,
        payment_method,
        payment_date: new Date(payment_date).toISOString(),
        remarks,
        wht_amount: parseFloat(formData.get('wht_amount') as string) || 0,
        retained_amount: parseFloat(formData.get('retained_amount') as string) || 0,
        ld_penalty: parseFloat(formData.get('ld_penalty') as string) || 0,
      } as any);

      const newStatus = newTotalPaid >= selectedInvoice.total_amount ? 'Paid' : 'Partially Paid';
      updateInvoiceDb(invoice_id, { status: newStatus });

      router.push('/payments');
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      setIsPending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Record Payment</h1>
          <p>Register a payment received from a customer.</p>
        </div>
        <div className="header-actions">
          <Link href="/payments" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Invoice *</label>
              <select 
                name="invoice_id"
                required
                value={selectedInvoiceId}
                onChange={e => setSelectedInvoiceId(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="">-- Select Unpaid Invoice --</option>
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.customer.customer_name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Payment Date *</label>
              <input 
                type="date"
                name="payment_date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          {selectedInvoice && (
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#166534' }}>Pending Balance for {selectedInvoice.invoice_number}:</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                  PKR {selectedInvoice.total_amount.toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', color: '#166534' }}>Customer:</p>
                <p style={{ fontWeight: 600 }}>{selectedInvoice.customer.customer_name}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Amount Paid *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>PKR</span>
                <input 
                  type="number"
                  name="amount_paid"
                  step="0.01"
                  required
                  placeholder="0.00"
                  defaultValue={selectedInvoice?.total_amount || ''}
                  style={{ padding: '0.75rem 0.75rem 0.75rem 3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Payment Method *</label>
              <select 
                name="payment_method"
                required
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>WHT / Income Tax</label>
              <input 
                type="number"
                name="wht_amount"
                step="0.01"
                placeholder="0.00"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Retained Amount</label>
              <input 
                type="number"
                name="retained_amount"
                step="0.01"
                placeholder="0.00"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>LD Penalty</label>
              <input 
                type="number"
                name="ld_penalty"
                step="0.01"
                placeholder="0.00"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Remarks / Reference</label>
            <input 
              type="text"
              name="remarks"
              placeholder="Cheque number, Transaction ID, etc."
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              <DollarSign size={18} />
              {isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
