import { supabase } from '@/lib/supabase';
import { Plus, Search, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import WarrantySearch from '@/components/WarrantySearch';

export default async function WarrantiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let warranties: any[] = [];
  try {
    let supabaseQuery = supabase
      .from('Warranty')
      .select('*, customer:Customer(*), invoice:Invoice(*, po:PurchaseOrder(*)), po:PurchaseOrder(*)')
      .order('id', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`warranty_number.ilike.%${query}%,customer(customer_name).ilike.%${query}%,po(po_number).ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    warranties = data || [];
  } catch (error) {
    console.error('Supabase error in WarrantiesPage:', error);
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Product Warranties</h1>
          <p>Manage and issue warranty certificates.</p>
        </div>
        <div className="header-actions">
          <Link href="/warranties/new" className="btn btn-primary">
            <Plus size={18} />
            Issue New Warranty
          </Link>
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Warranties</h3>
            <p>{warranties.filter(w => w.status === 'Active').length}</p>
          </div>
        </div>
      </div>

      <WarrantySearch />

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Warranty #</th>
                <th>Customer</th>
                <th>PO Reference</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warranties.length > 0 ? warranties.map((warranty) => (
                <tr key={warranty.id}>
                  <td style={{ fontWeight: 600 }}>{warranty.warranty_number || `WR-${warranty.id}`}</td>
                  <td>{warranty.customer.customer_name}</td>
                  <td>{warranty.invoice?.po?.po_number || (warranty as any).po?.po_number || '-'}</td>
                  <td>{new Date(warranty.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${warranty.status.toLowerCase()}`}>
                      {warranty.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/warranties/${warranty.id}`} className="btn" style={{ padding: '4px' }} title="View Certificate">
                        <ExternalLink size={18} />
                      </Link>
                      <Link href={`/warranties/${warranty.id}`} className="btn" style={{ padding: '4px' }} title="Download PDF">
                        <Download size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No warranties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
