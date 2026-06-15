'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldPlus, FileText, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getInvoices, getChallans, getPurchaseOrders, getCustomers, saveWarranty } from '@/lib/mockDb';

export default function NewWarrantyPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [type, setType] = useState<'INV' | 'DC'>('INV');
  const [selectedRefId, setSelectedRefId] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allInvoices = getInvoices();
    const allChallans = getChallans();
    const allPOs = getPurchaseOrders();
    const allCustomers = getCustomers();

    const formattedInvoices = allInvoices.map(inv => ({
      ...inv,
      po: allPOs.find(p => p.id === inv.po_id),
      customer: allCustomers.find(c => c.id === inv.customer_id) || { customer_name: 'Unknown' },
      items: (inv as any).items || [] // Mock db doesn't deep populate items yet, but we'll assume it's there for UInow
    }));

    const formattedChallans = allChallans.map(ch => ({
      ...ch,
      po: allPOs.find(p => p.id === ch.po_id),
      customer: allCustomers.find(c => c.id === ch.customer_id) || { customer_name: 'Unknown' },
      items: ch.items || []
    }));

    setInvoices(formattedInvoices);
    setChallans(formattedChallans);
  }, []);

  const selectedItem = type === 'INV' 
    ? invoices.find(inv => inv.id.toString() === selectedRefId)
    : challans.find(ch => ch.id.toString() === selectedRefId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const warranty_type = formData.get('warranty_type') as string;
      const ref_id = parseInt(formData.get('ref_id') as string);
      const duration_years = parseInt(formData.get('duration_years') as string);
      const terms = formData.get('terms') as string;

      if (!selectedItem) throw new Error('Selected reference not found');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + duration_years);

      saveWarranty({
        warranty_number: `WR-${Date.now()}`,
        customer_id: selectedItem.customer_id,
        invoice_id: warranty_type === 'INV' ? ref_id : undefined,
        challan_id: warranty_type === 'DC' ? ref_id : undefined,
        warranty_type: warranty_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        terms: terms,
      });

      router.push('/warranties');
    } catch (err: any) {
      setError(err.message || 'Failed to create warranty');
      setIsPending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Issue Warranty</h1>
          <p>Generate a warranty certificate based on an Invoice or Delivery Challan (DC).</p>
        </div>
        <div className="header-actions">
          <Link href="/warranties" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
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

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Warranty Basis *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => { setType('INV'); setSelectedRefId(''); }}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius)', border: '2px solid',
                  borderColor: type === 'INV' ? 'var(--primary)' : 'var(--border)',
                  background: type === 'INV' ? 'var(--primary-soft)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <FileText size={18} color={type === 'INV' ? 'var(--primary)' : '#64748b'} />
                <span style={{ fontWeight: 600, color: type === 'INV' ? 'var(--primary)' : '#64748b' }}>Invoice (INV)</span>
              </button>
              <button 
                type="button"
                onClick={() => { setType('DC'); setSelectedRefId(''); }}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius)', border: '2px solid',
                  borderColor: type === 'DC' ? 'var(--primary)' : 'var(--border)',
                  background: type === 'DC' ? 'var(--primary-soft)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Truck size={18} color={type === 'DC' ? 'var(--primary)' : '#64748b'} />
                <span style={{ fontWeight: 600, color: type === 'DC' ? 'var(--primary)' : '#64748b' }}>Delivery Challan (DC)</span>
              </button>
            </div>
            <input type="hidden" name="warranty_type" value={type} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select {type === 'INV' ? 'Invoice' : 'Delivery Challan'} *</label>
            <select 
              name="ref_id"
              required
              value={selectedRefId}
              onChange={e => setSelectedRefId(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">-- Select {type === 'INV' ? 'Invoice' : 'DC'} --</option>
              {type === 'INV' ? (
                invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.customer.customer_name}</option>
                ))
              ) : (
                challans.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.gdn_number} - {ch.customer.customer_name}</option>
                ))
              )}
            </select>
          </div>

          {selectedItem && (
            <div className="animate-fade-in" style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>The warranty will be linked to:</p>
              <p style={{ fontWeight: 600 }}>PO Number: {selectedItem.po?.po_number || 'N/A'}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Products covered:</p>
                <ul style={{ fontSize: '0.875rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {selectedItem.items?.map((item: any) => (
                    <li key={item.id}>{item.product?.product_name || `Product ID ${item.product_id}`}</li>
                  ))}
                  {(!selectedItem.items || selectedItem.items.length === 0) && <li>No specific items listed</li>}
                </ul>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Warranty Duration *</label>
              <select 
                name="duration_years"
                required
                defaultValue="1"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Warranty Terms</label>
            <textarea 
              name="terms"
              rows={3}
              defaultValue="Standard 1 Year Warranty against manufacturing defects. Terms and conditions apply."
              style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={isPending || !selectedRefId} className="btn btn-primary">
              <ShieldPlus size={18} />
              {isPending ? 'Generating...' : 'Generate Warranty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
