import { supabase } from '@/lib/supabase';
import { Plus, Tag } from 'lucide-react';
import Link from 'next/link';
import ProductSearch from '@/components/ProductSearch';
import ProductActions from '@/components/ProductActions';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let products: any[] = [];
  try {
    let supabaseQuery = supabase
      .from('Product')
      .select('*')
      .order('created_at', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`product_name.ilike.%${query}%,product_code.ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    products = data || [];
  } catch (error) {
    console.error('Supabase error in ProductsPage:', error);
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Products</h1>
          <p>Manage your product catalog and pricing.</p>
        </div>
        <div className="header-actions">
          <Link href="/products/new" className="btn btn-primary">
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </header>

      <ProductSearch />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
            <Tag size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Items</p>
            <p style={{ fontWeight: 700 }}>{products.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id}>
                <td style={{ fontWeight: 600 }}>{product.product_code}</td>
                <td>{product.product_name}</td>
                <td>PKR {product.unit_price.toLocaleString()}</td>
                <td>{new Date(product.created_at).toLocaleDateString()}</td>
                <td>
                  <ProductActions id={product.id} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
