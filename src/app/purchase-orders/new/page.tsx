import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import POForm from './POForm';

export default async function NewPOPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { customer_name: 'asc' }
  });
  
  const products = await prisma.product.findMany({
    orderBy: { product_name: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Create Purchase Order</h1>
          <p>Generate a new purchase order and track production.</p>
        </div>
        <div className="header-actions">
          <Link href="/purchase-orders" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <POForm customers={customers} products={products} />
    </div>
  );
}
