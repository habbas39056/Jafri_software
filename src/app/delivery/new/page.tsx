import { getPendingPurchaseOrders } from '@/app/delivery/actions';
import GDNForm from './GDNForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewGDNPage() {
  const pendingPOs = await getPendingPurchaseOrders();

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Generate Goods Delivery Note (GDN)</h1>
          <p>Create a new challan for shipping products to customers.</p>
        </div>
        <div className="header-actions">
          <Link href="/delivery" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </header>

      <GDNForm pendingPOs={pendingPOs} />
    </div>
  );
}
