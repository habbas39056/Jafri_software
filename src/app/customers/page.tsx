import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CustomerSearch from '@/components/CustomerSearch';
import CustomerActions from '@/components/CustomerActions';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  let customers: any[] = [];
  let error: string | null = null;

  try {
    let supabaseQuery = supabase
      .from('Customer')
      .select('*')
      .order('created_at', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`customer_name.ilike.%${query}%,ntn.ilike.%${query}%,vendor_code.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const { data, error: supabaseError } = await supabaseQuery;

    if (supabaseError) throw supabaseError;
    customers = data || [];
  } catch (e: any) {
    console.error("Supabase error in CustomersPage:", e);
    error = e.message || "Could not connect to the database.";
  }

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Customers</h1>
          <p>Manage your client database and registration details.</p>
        </div>
        <div className="header-actions">
          <Link href="/customers/new" className="btn btn-primary">
            <Plus size={18} />
            Add Customer
          </Link>
        </div>
      </header>

      <CustomerSearch />

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          <strong>Database Connection Error:</strong> {error}
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Make sure your database is initialized and the DATABASE_URL is correct.</p>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Address</th>
              <th>NTN</th>
              <th>GST Reg.</th>
              <th>Vendor Code</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!error && customers.length > 0 ? customers.map((customer) => (
              <tr key={customer.id}>
                <td style={{ fontWeight: 600 }}>{customer.customer_name}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.address}</td>
                <td>{customer.ntn || '-'}</td>
                <td>{customer.sales_tax_registration || '-'}</td>
                <td>{customer.vendor_code || '-'}</td>
                <td>{customer.phone || '-'}</td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                  <CustomerActions id={customer.id} />
                </td>
              </tr>
            )) : !error && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
