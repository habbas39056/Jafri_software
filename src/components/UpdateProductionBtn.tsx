'use client';

import { useState, useTransition } from 'react';
import { updateProductionTracking } from '@/app/production/actions';

export default function UpdateProductionBtn({ 
  tracking 
}: { 
  tracking: {
    id: number;
    ordered_qty: number;
    delivered_qty: number;
    rejected_qty: number;
    product_name: string;
    po_number: string;
  } 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [delivered, setDelivered] = useState(tracking.delivered_qty);
  const [rejected, setRejected] = useState(tracking.rejected_qty);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    if (delivered + rejected > tracking.ordered_qty) {
      alert("Delivered + Rejected cannot exceed total ordered quantity!");
      return;
    }

    startTransition(async () => {
      await updateProductionTracking(tracking.id, {
        delivered_qty: delivered,
        rejected_qty: rejected
      });
      setIsOpen(false);
    });
  };

  return (
    <>
      <button 
        className="btn" 
        onClick={() => setIsOpen(true)}
        style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border)' }}
      >
        Update
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Update Production
            </h3>
            
            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              <p><strong>PO NO:</strong> {tracking.po_number}</p>
              <p><strong>Product:</strong> {tracking.product_name}</p>
              <p><strong>Ordered Qty:</strong> {tracking.ordered_qty}</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>Total Delivered</label>
                <input 
                  type="number" 
                  min="0"
                  max={tracking.ordered_qty}
                  value={delivered} 
                  onChange={e => setDelivered(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>Total Rejected</label>
                <input 
                  type="number" 
                  min="0"
                  max={tracking.ordered_qty}
                  value={rejected} 
                  onChange={e => setRejected(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ padding: '0.5rem', background: 'var(--background)', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Pending Calculation:</span><br/>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                  {tracking.ordered_qty - delivered - rejected}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn" 
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdate}
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
