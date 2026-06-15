'use client';

import { getInvoices, getCustomers, getPurchaseOrders, getProducts, Invoice, Customer, PurchaseOrder, Product } from '@/lib/mockDb';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InvoiceForm from '../../new/InvoiceForm';
import { use, useEffect, useState } from 'react';

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
    setPurchaseOrders(getPurchaseOrders());
    setProducts(getProducts());
    
    const invoices = getInvoices();
    const foundInvoice = invoices.find(inv => inv.id === parseInt(resolvedParams.id, 10));
    setInvoice(foundInvoice || null);
  }, [resolvedParams.id]);

  if (!invoice) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Invoice Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested invoice could not be loaded.</p>
        <Link href="/invoices" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Edit Invoice</h1>
          <p>Update invoice details for {invoice.invoice_number}</p>
        </div>
        <div className="header-actions">
          <Link href="/invoices" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <InvoiceForm 
        customers={customers} 
        pos={purchaseOrders} 
        products={products} 
        initialData={invoice} 
      />
    </div>
  );
}
