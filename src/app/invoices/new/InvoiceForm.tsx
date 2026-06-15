'use client';

import { useState, useEffect } from 'react';
import { saveInvoice, updateInvoiceDb, Customer, PurchaseOrder, Product, Invoice } from '@/lib/mockDb';
import { FileText, Save, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvoiceForm({ 
  customers, 
  pos, 
  products,
  initialData 
}: { 
  customers: Customer[], 
  pos: PurchaseOrder[], 
  products: Product[],
  initialData?: Invoice 
}) {
  const router = useRouter();
  const [selectedPOId, setSelectedPOId] = useState<string>(initialData ? initialData.po_id.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoice_number: initialData ? initialData.invoice_number : '',
    invoice_date: initialData ? new Date(initialData.invoice_date).toISOString().split('T')[0] : '',
    gst_percentage: 18 // Default, update calculation based on existing if needed, but we don't store percentage. Hardcoding for UI.
  });

  useEffect(() => {
    if (!initialData) {
      setInvoiceDetails(prev => ({
        ...prev,
        invoice_number: prev.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: prev.invoice_date || new Date().toISOString().split('T')[0]
      }));
    }
  }, [initialData]);

  const selectedPO = pos.find(po => po.id.toString() === selectedPOId);

  const calculateSubtotal = () => {
    if (!selectedPO) return 0;
    return (selectedPO.items || []).reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
  };

  const subtotal = calculateSubtotal();
  const gstAmount = (subtotal * invoiceDetails.gst_percentage) / 100;
  const totalAmount = subtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        po_id: selectedPO.id,
        customer_id: selectedPO.customer_id,
        invoice_number: invoiceDetails.invoice_number,
        invoice_date: invoiceDetails.invoice_date,
        subtotal,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        status: initialData ? initialData.status : 'Pending'
      };

      if (initialData) {
        updateInvoiceDb(initialData.id, payload);
      } else {
        saveInvoice(payload);
      }
      
      router.push('/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
      setIsSubmitting(false);
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
              disabled={!!initialData}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">-- Select PO --</option>
              {pos.map(po => {
                const customer = customers.find(c => c.id === po.customer_id);
                return (
                  <option key={po.id} value={po.id}>{po.po_number} - {customer?.customer_name || 'Unknown'}</option>
                );
              })}
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
                  {(selectedPO.items || []).map((item: any) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <tr key={item.product_id}>
                        <td style={{ fontWeight: 600 }}>{product?.product_name || 'Unknown'}</td>
                        <td>{item.quantity}</td>
                        <td>{item.rate.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>{(item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    );
                  })}
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
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Invoice' : 'Generate Tax Invoice')}
          </button>
        </div>
      </form>
    </div>
  );
}
