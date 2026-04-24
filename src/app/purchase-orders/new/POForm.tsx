'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { createPurchaseOrder } from '../actions';

export default function POForm({ 
  customers, 
  products 
}: { 
  customers: any[], 
  products: any[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [poDetails, setPoDetails] = useState({
    po_number: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_id: '',
    po_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gst_percentage: 18.0
  });

  const [items, setItems] = useState([{ product_id: '', quantity: 1, rate: 0, total_amount: 0 }]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    const newItems = [...items];
    newItems[index].product_id = productId;
    
    if (product) {
      newItems[index].rate = product.unit_price;
      newItems[index].total_amount = product.unit_price * newItems[index].quantity;
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total_amount = newItems[index].rate * quantity;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, rate: 0, total_amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!poDetails.customer_id) {
      setError('Please select a customer.');
      setIsSubmitting(false);
      return;
    }

    const validItems = items.filter(item => item.product_id !== '' && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid product to the order.');
      setIsSubmitting(false);
      return;
    }

    const formattedItems = validItems.map(item => ({
      product_id: parseInt(item.product_id),
      quantity: item.quantity,
      rate: item.rate,
      total_amount: item.total_amount
    }));

    const result = await createPurchaseOrder({
      ...poDetails,
      customer_id: parseInt(poDetails.customer_id),
      items: formattedItems
    });

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>PO Number *</label>
              <input 
                type="text" 
                required 
                value={poDetails.po_number}
                onChange={e => setPoDetails({...poDetails, po_number: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Customer *</label>
              <select 
                required
                value={poDetails.customer_id}
                onChange={e => setPoDetails({...poDetails, customer_id: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.customer_name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Order Date *</label>
              <input 
                type="date" 
                required 
                value={poDetails.po_date}
                onChange={e => setPoDetails({...poDetails, po_date: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Due Date *</label>
              <input 
                type="date" 
                required 
                value={poDetails.due_date}
                onChange={e => setPoDetails({...poDetails, due_date: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>GST / SRB Rate *</label>
              <select 
                required
                value={poDetails.gst_percentage}
                onChange={e => setPoDetails({...poDetails, gst_percentage: parseFloat(e.target.value)})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
              >
                <option value={15}>15%</option>
                <option value={18}>18%</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Order Items</h2>
            <button type="button" onClick={addItem} className="btn" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {items.map((item, index: number) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Product</label>
                  <select 
                    required
                    value={item.product_id}
                    onChange={e => handleProductSelect(index, e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white' }}
                  >
                    <option value="">Select...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.product_name} ({p.product_code})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Quantity</label>
                  <input 
                    type="number" 
                    required min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Rate (PKR)</label>
                  <input 
                    type="number" 
                    readOnly
                    value={item.rate}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: '#f1f5f9' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total</label>
                  <input 
                    type="number" 
                    readOnly
                    value={item.total_amount}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: '#f1f5f9', fontWeight: 600 }}
                  />
                </div>

                <button 
                  type="button" 
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="btn"
                  style={{ padding: '0.5rem', color: 'var(--danger)', border: '1px solid var(--border)', background: 'white', opacity: items.length === 1 ? 0.5 : 1 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', fontSize: '1.25rem' }}>
            <div style={{ background: 'var(--background)', padding: '1rem 2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <span style={{ color: '#64748b', marginRight: '1rem' }}>Grand Total:</span>
              <span style={{ fontWeight: 700 }}>PKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            {isSubmitting ? 'Saving...' : <><Save size={20} /> Save Purchase Order</>}
          </button>
        </div>
      </form>
    </div>
  );
}
