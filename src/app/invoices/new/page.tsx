'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InvoiceForm from './InvoiceForm';
import { getCustomers, Customer, getPurchaseOrders, PurchaseOrder, getProducts, Product } from '@/lib/mockDb';

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
    setPurchaseOrders(getPurchaseOrders());
    setProducts(getProducts());
  }, []);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Create Invoice</h1>
          <p>Generate a new sales tax invoice for a purchase order.</p>
        </div>
        <div className="header-actions">
          <Link href="/invoices" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <InvoiceForm customers={customers} pos={purchaseOrders} products={products} />
    </div>
  );
}
