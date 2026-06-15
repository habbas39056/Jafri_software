'use client';

import { getPurchaseOrders, PurchaseOrder, getCustomers, Customer, getProducts } from '@/lib/mockDb';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import POForm from '../../new/POForm';
import { use, useEffect, useState } from 'react';

export default function EditPOPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<any[]>([]); 

  useEffect(() => {
    const allPos = getPurchaseOrders();
    const foundPo = allPos.find(p => p.id === parseInt(resolvedParams.id, 10));
    setPo(foundPo || null);
    
    setCustomers(getCustomers());
    setProducts(getProducts());
  }, [resolvedParams.id]);

  if (!po) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Purchase Order Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested PO could not be loaded.</p>
        <Link href="/purchase-orders" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to POs</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Edit Purchase Order</h1>
          <p>Update purchase order {po.po_number}</p>
        </div>
        <div className="header-actions">
          <Link href="/purchase-orders" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      {/* For now, reuse the new form (this is a placeholder for a full edit form in testing phase) */}
      <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffeeba' }}>
        <strong>Testing Phase Note:</strong> Database fetching is mocked using local storage. 
      </div>
      <POForm customers={customers} products={products} initialData={po} />
    </div>
  );
}
