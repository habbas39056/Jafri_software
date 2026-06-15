'use client';

import { useState, useEffect } from 'react';
import { Plus, Truck, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import ChallanActions from '@/components/ChallanActions';
import { getChallans, getCustomers, getPurchaseOrders, getProducts, Challan, Customer, PurchaseOrder, Product } from '@/lib/mockDb';

export default function DeliveryPage() {
  const [challans, setChallans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allChallans = getChallans();
      const customers = getCustomers();
      const pos = getPurchaseOrders();
      const products = getProducts();

      const enrichedChallans = allChallans.map(challan => ({
        ...challan,
        customer: customers.find(c => c.id === challan.customer_id) || { customer_name: 'Unknown' },
        po: pos.find(p => p.id === challan.po_id) || { po_number: 'Unknown' },
        items: challan.items.map(item => ({
          ...item,
          product: products.find(p => p.id === item.product_id) || { product_name: 'Unknown' }
        }))
      }));
      
      enrichedChallans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setChallans(enrichedChallans);
    } catch (e: any) {
      setError(e.message || "Failed to load challans");
    }
  }, []);
  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Delivery (Challan)</h1>
          <p>Manage Goods Delivery Notes (GDN) and shipments.</p>
        </div>
        <div className="header-actions">
          <Link href="/delivery/new" className="btn btn-primary">
            <Plus size={18} />
            Generate GDN
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {challans.length > 0 ? challans.map((challan) => (
          <div key={challan.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem' }}>{challan.gdn_number}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>PO: {challan.po.po_number}</p>
                </div>
              </div>
              <span className={`badge badge-${challan.status.toLowerCase()}`}>
                {challan.status}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem' }}>Date: {new Date(challan.challan_date).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 600 }}>
                Customer: {challan.customer.customer_name}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Delivered Items</p>
              {challan.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{item.product.product_name}</span>
                  <span style={{ fontWeight: 600 }}>{item.delivered_qty} Units</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href={`/delivery/${challan.id}`} className="btn" style={{ flex: '1 1 100px', border: '1px solid var(--border)', background: 'white', textAlign: 'center' }}>
                View & Print GDN
              </Link>
              <Link href="/invoices/new" className="btn btn-primary" style={{ flex: '1 1 100px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                <FileText size={16} /> Create Invoice
              </Link>
              <ChallanActions id={challan.id} />
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <Truck size={48} style={{ color: '#e2e8f0', marginBottom: '1rem' }} />
            <h3 style={{ color: '#64748b' }}>No delivery records found.</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Start by generating a Goods Delivery Note from a PO.</p>
          </div>
        )}
      </div>
    </div>
  );
}
