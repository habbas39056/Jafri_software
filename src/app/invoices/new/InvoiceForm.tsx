'use client';

import { useState } from 'react';
import { createInvoice } from '../actions';
import { FileText, Save, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PO = {
  id: number;
  po_number: string;
  customer_id: number;
  customer: { customer_name: string; address: string | null };
  items: {
    product_id: number;
    product: { product_name: string; product_code: string };
    quantity: number;
    rate: number;
  }[];
  deliveries: any[];
};

export default function InvoiceForm({ pendingPOs }: { pendingPOs: any[] }) {
  const router = useRouter();
  const [selectedPOId, setSelectedPOId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    gst_percentage: 18
  });

  const selectedPO = pendingPOs.find(po => po.id.toString() === selectedPOId);

  const calculateSubtotal = () => {
    if (!selectedPO) return 0;
    return selectedPO.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
  };

  const subtotal = calculateSubtotal();
  const gstAmount = (subtotal * invoiceDetails.gst_percentage) / 100;
  const totalAmount = subtotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    
    setIsSubmitting(true);
    setError('');

    const payload = {
      po_id: selectedPO.id,
      invoice_number: invoiceDetails.invoice_number,
      invoice_date: invoiceDetails.invoice_date,
      gst_percentage: invoiceDetails.gst_percentage,
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      items: selectedPO.items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))
    };

    const res = await createInvoice(null, payload);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.push('/invoices');
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Purchase Order *</label>
            <select 
              required
              value={selectedPOId}
              onChange={e => setSelectedPOId(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">-- Select PO --</option>
              {pendingPOs.map(po => (
                <option key={po.id} value={po.id}>{po.po_number} - {po.customer.customer_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Invoice Number *</label>
            <input 
              type="text" 
              required 
              value={invoiceDetails.invoice_number}
              onChange={e => setInvoiceDetails({...invoiceDetails, invoice_number: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Invoice Date *</label>
            <input 
              type="date" 
              required 
              value={invoiceDetails.invoice_date}
              onChange={e => setInvoiceDetails({...invoiceDetails, invoice_date: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>GST Rate (%) *</label>
            <select 
              required
              value={invoiceDetails.gst_percentage}
              onChange={e => setInvoiceDetails({...invoiceDetails, gst_percentage: parseInt(e.target.value)})}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value={15}>15%</option>
              <option value={18}>18%</option>
            </select>
          </div>
        </div>

        {selectedPO && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Items Summary</h2>
            <div className="table-container" style={{ border: 'none', marginBottom: '1.5rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map((item: any) => (
                    <tr key={item.product_id}>
                      <td style={{ fontWeight: 600 }}>{item.product.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.rate.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{(item.quantity * item.rate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px', display: 'grid', gap: '0.75rem', background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>GST ({invoiceDetails.gst_percentage}%):</span>
                  <span style={{ fontWeight: 600 }}>PKR {gstAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Total Amount:</span>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>PKR {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <button 
            type="button"
            className="btn" 
            onClick={() => router.back()}
            disabled={isSubmitting}
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !selectedPO}
          >
            <FileText size={18} />
            {isSubmitting ? 'Generating...' : 'Generate Tax Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
