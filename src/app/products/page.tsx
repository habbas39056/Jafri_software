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

      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {products.length > 0 ? products.map((product) => (
          <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Image Section */}
            <div style={{ position: 'relative', height: '200px', background: '#f8fafc' }}>
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.product_name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <Tag size={48} strokeWidth={1} />
                </div>
              )}
              
              {/* HS Code Badge */}
              {product.hs_code && (
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  color: 'var(--primary)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 10,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {product.hs_code}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)' }}>{product.product_name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{product.product_code}</p>
                </div>
                {product.hs_code && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>HS Code</p>
                    <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{product.hs_code}</p>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p style={{ margin: '0', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Price</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)' }}>
                    <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>Rs.</span>
                    {product.unit_price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Created</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                    {new Date(product.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <ProductActions id={product.id} />
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Tag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No products found in your catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
