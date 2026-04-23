import { prisma } from '@/lib/prisma';
import { Plus, Truck, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function DeliveryPage() {
  const challans = await prisma.challan.findMany({
    include: {
      customer: true,
      po: true,
      items: { include: { product: true } }
    },
    orderBy: { challan_date: 'desc' }
  });

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
              {challan.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{item.product.product_name}</span>
                  <span style={{ fontWeight: 600 }}>{item.delivered_qty} Units</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href={`/delivery/${challan.id}`} className="btn" style={{ flex: 1, border: '1px solid var(--border)', background: 'white', textAlign: 'center' }}>
                View & Print GDN
              </Link>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                <FileText size={16} /> Create Invoice
              </button>
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
