import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import POForm from './POForm';

export default async function NewPOPage() {
  const { data: customers } = await supabase
    .from('Customer')
    .select('*')
    .order('customer_name', { ascending: true });
  
  const { data: products } = await supabase
    .from('Product')
    .select('*')
    .order('product_name', { ascending: true });


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

      <POForm customers={customers || []} products={products || []} />
    </div>
  );
}
