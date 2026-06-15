'use client';

import { useState, useEffect } from 'react';
import { saveChallan, updateChallanDb, Challan } from '@/lib/mockDb';
import { Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PO = {
  id: number;
  po_number: string;
  customer_id: number;
  customer: { customer_name: string; address: string | null };
  production: {
    product_id: number;
    ordered_qty: number;
    delivered_qty: number;
    pending_qty: number;
  }[];
  items: {
    product_id: number;
    product: { product_name: string; product_code: string };
  }[];
};

export default function GDNForm({ pendingPOs, initialData }: { pendingPOs: PO[], initialData?: Challan }) {
  const router = useRouter();
  const [selectedPOId, setSelectedPOId] = useState<string>(initialData ? initialData.po_id.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [gdnDetails, setGdnDetails] = useState({
    gdn_number: initialData ? initialData.gdn_number : '',
    challan_date: initialData ? new Date(initialData.challan_date).toISOString().split('T')[0] : ''
  });

  useEffect(() => {
    if (!initialData) {
      setGdnDetails(prev => ({
        ...prev,
        gdn_number: prev.gdn_number || `GDN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        challan_date: prev.challan_date || new Date().toISOString().split('T')[0]
      }));
    }
  }, [initialData]);

  const selectedPO = pendingPOs.find(po => po.id.toString() === selectedPOId);

  const [deliveryItems, setDeliveryItems] = useState<{product_id: number, qty: number, max: number}[]>(
    initialData ? initialData.items.map(item => ({
      product_id: item.product_id,
      qty: item.delivered_qty,
      max: item.delivered_qty // For edit mode, max could be more complex, but keeping it simple for testing
    })) : []
  );

  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    const po = pendingPOs.find(p => p.id.toString() === poId);
    if (po) {
      const items = po.production
        .filter(p => p.pending_qty > 0)
        .map(p => ({
          product_id: p.product_id,
          qty: p.pending_qty,
          max: p.pending_qty
        }));
      setDeliveryItems(items);
    } else {
      setDeliveryItems([]);
    }
  };

  const handleQtyChange = (productId: number, qty: number) => {
    setDeliveryItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, qty } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    setIsSubmitting(true);
    setError('');

    const validItems = deliveryItems.filter(item => item.qty > 0);
    
    if (validItems.length === 0) {
      setError('You must deliver at least 1 unit of a product.');
      setIsSubmitting(false);
      return;
    }

    // Validation check for over-delivery
    for (const item of validItems) {
      if (item.qty > item.max && !initialData) {
        setError(`Cannot deliver more than pending quantity (${item.max}) for product ID ${item.product_id}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        gdn_number: gdnDetails.gdn_number,
        po_id: selectedPO.id,
        customer_id: selectedPO.customer_id,
        challan_date: gdnDetails.challan_date,
        status: initialData ? initialData.status : 'Delivered',
        items: validItems.map((i, index) => ({
          id: initialData?.items[index]?.id || Date.now() + index, // Mock ID for testing
          challan_id: initialData?.id || 0,
          product_id: i.product_id,
          delivered_qty: i.qty
        }))
      };

      if (initialData) {
        updateChallanDb(initialData.id, payload);
      } else {
        saveChallan(payload);
      }
      
      router.push('/delivery');
    } catch (err: any) {
      setError(err.message || 'Failed to save delivery note');
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

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>GDN Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>GDN Number *</label>
              <input 
                type="text" 
                required 
                value={gdnDetails.gdn_number}
                onChange={e => setGdnDetails({...gdnDetails, gdn_number: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Purchase Order *</label>
              <select 
                required
                value={selectedPOId}
                onChange={e => handlePOSelect(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="">-- Select PO --</option>
                {pendingPOs.map((po: any) => (
                  <option key={po.id} value={po.id}>{po.po_number} - {po.customer.customer_name} [{po.status}]</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Delivery Date *</label>
              <input 
                type="date" 
                required 
                value={gdnDetails.challan_date}
                onChange={e => setGdnDetails({...gdnDetails, challan_date: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>

        {selectedPO && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Items to Deliver</h2>
            {deliveryItems.length > 0 ? (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Pending Qty</th>
                      <th style={{ width: '150px' }}>Delivery Qty *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryItems.map((dItem) => {
                      const productDetails = selectedPO.items.find(i => i.product_id === dItem.product_id)?.product;
                      return (
                        <tr key={dItem.product_id}>
                          <td style={{ fontWeight: 600 }}>{productDetails?.product_name} <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '8px' }}>{productDetails?.product_code}</span></td>
                          <td><span className="badge badge-pending">{dItem.max}</span></td>
                          <td>
                            <input 
                              type="number" 
                              min="0"
                              max={dItem.max}
                              required
                              value={dItem.qty}
                              onChange={e => handleQtyChange(dItem.product_id, parseInt(e.target.value) || 0)}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--primary)', borderRadius: '4px', textAlign: 'center' }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>All items in this PO are fully delivered.</p>
            )}
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
            disabled={isSubmitting || !selectedPO || deliveryItems.length === 0}
          >
            <Truck size={18} />
            {isSubmitting ? 'Creating...' : 'Generate GDN'}
          </button>
        </div>
      </form>
    </div>
  );
}
