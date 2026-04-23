import { prisma } from '@/lib/prisma';
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

  const customers = await prisma.customer.findMany({
    where: query ? {
      OR: [
        { customer_name: { contains: query } },
        { ntn: { contains: query } },
        { vendor_code: { contains: query } },
        { phone: { contains: query } }
      ]
    } : {},
    orderBy: { created_at: 'desc' }
  });

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
            {customers.length > 0 ? customers.map((customer) => (
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
            )) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
