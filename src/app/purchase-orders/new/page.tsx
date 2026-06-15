'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import POForm from './POForm';
import { getCustomers, Customer, getProducts, Product } from '@/lib/mockDb';

export default function NewPOPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
  }, []);

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
