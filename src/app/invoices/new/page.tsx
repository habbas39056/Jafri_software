import { getInvoicablePOs } from '../actions';
import InvoiceForm from './InvoiceForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewInvoicePage() {
  const pendingPOs = await getInvoicablePOs();

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Generate Tax Invoice</h1>
          <p>Create a sales tax invoice for delivered goods.</p>
        </div>
        <div className="header-actions">
          <Link href="/invoices" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </header>

      <InvoiceForm pendingPOs={pendingPOs} />
    </div>
  );
}
