'use client';

import { useState, useEffect, use } from 'react';
import GDNForm from '../../new/GDNForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseOrders, getCustomers, getProducts, getChallans, Challan } from '@/lib/mockDb';

export default function EditGDNPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [pos, setPOs] = useState<any[]>([]);
  const [challan, setChallan] = useState<Challan | null>(null);

  useEffect(() => {
    const allPos = getPurchaseOrders();
    const allCustomers = getCustomers();
    const allProducts = getProducts();
    const allChallans = getChallans();

    const currentChallan = allChallans.find(c => c.id === parseInt(resolvedParams.id, 10));
    setChallan(currentChallan || null);

    // Calculate pending POs (same logic as New GDN page)
    const enrichedPOs = allPos.map(po => {
      const deliveredMap: Record<number, number> = {};
      allChallans.filter(c => c.po_id === po.id).forEach(c => {
        c.items.forEach(i => {
          deliveredMap[i.product_id] = (deliveredMap[i.product_id] || 0) + i.delivered_qty;
        });
      });

      return {
        ...po,
        customer: allCustomers.find(c => c.id === po.customer_id) || { customer_name: 'Unknown' },
        items: (po.items || []).map(item => ({
          ...item,
          product: allProducts.find(p => p.id === item.product_id) || { product_name: 'Unknown', product_code: '' }
        })),
        production: (po.items || []).map(item => ({
          product_id: item.product_id,
          ordered_qty: item.quantity,
          delivered_qty: deliveredMap[item.product_id] || 0,
          pending_qty: item.quantity - (deliveredMap[item.product_id] || 0)
        }))
      };
    });

    setPOs(enrichedPOs);
  }, [resolvedParams.id]);

  if (!challan) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>GDN Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested Goods Delivery Note could not be loaded.</p>
        <Link href="/delivery" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to Delivery</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Edit Goods Delivery Note (GDN)</h1>
          <p>Update details for {challan.gdn_number}</p>
        </div>
        <div className="header-actions">
          <Link href="/delivery" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </header>

      <GDNForm pendingPOs={pos} initialData={challan} />
    </div>
  );
}
