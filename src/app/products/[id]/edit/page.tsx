'use client';

import { getProducts, Product } from '@/lib/mockDb';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditProductForm from './EditProductForm';
import { use, useEffect, useState } from 'react';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const products = getProducts();
    const foundProduct = products.find(p => p.id === parseInt(resolvedParams.id, 10));
    setProduct(foundProduct || null);
  }, [resolvedParams.id]);

  if (!product) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested product could not be loaded.</p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to Products</Link>
      </div>
    );
  }

  return <EditProductForm product={product} />;
}
