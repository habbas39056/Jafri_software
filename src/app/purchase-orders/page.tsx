'use client';

import { useState, useEffect, use } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import POSearch from '@/components/POSearch';
import POActions from '@/components/POActions';
import { getPurchaseOrders, PurchaseOrder, getCustomers, Customer } from '@/lib/mockDb';

export default function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; customer?: string }> | { q?: string; status?: string; customer?: string };
}) {
  const resolvedSearchParams = searchParams instanceof Promise ? use(searchParams as Promise<any>) : searchParams;
  const query = resolvedSearchParams?.q || '';
  const status = resolvedSearchParams?.status || '';
  const customerId = resolvedSearchParams?.customer || '';

  const [purchaseOrders, setPurchaseOrders] = useState<(PurchaseOrder & { customer?: Customer })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allPos = getPurchaseOrders();
      const allCustomers = getCustomers();
      setCustomers(allCustomers);

      let data = allPos.map(po => ({
        ...po,
        customer: allCustomers.find(c => c.id === po.customer_id)
      }));

      if (query) {
        const lowerQuery = query.toLowerCase();
        data = data.filter(po => 
          po.po_number.toLowerCase().includes(lowerQuery) ||
          po.customer?.customer_name.toLowerCase().includes(lowerQuery)
        );
      }

      if (status) {
        data = data.filter(po => po.status.toLowerCase() === status.toLowerCase());
      }

      if (customerId) {
        data = data.filter(po => po.customer_id.toString() === customerId);
      }

      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPurchaseOrders(data);
    } catch (e: any) {
      setError(e.message || "Could not fetch from local storage.");
    }
  }, [query, status, customerId]);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Purchase Orders</h1>
          <p>Manage purchase orders, customer commitments, and production planning.</p>
        </div>
        <div className="header-actions">
          <Link href="/purchase-orders/new" className="btn btn-primary">
            <Plus size={18} />
            Create PO
          </Link>
        </div>
      </header>

      <POSearch customers={customers} />

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Product Code</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {!error && purchaseOrders.length > 0 ? purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td style={{ fontWeight: 600 }}>{po.po_number}</td>
                <td>{po.customer?.customer_name || 'Unknown'}</td>
                <td>{po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(po.items || []).map((item: any, i: number) => (
                      <div key={i}>{item.product?.product_name || `Product ID: ${item.product_id}`} x {item.quantity}</div>
                    ))}
                    {(!po.items || po.items.length === 0) && <span style={{color: '#64748b'}}>No items</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
                    {(po.items || []).map((item: any, i: number) => (
                      <div key={i}>{item.product?.product_code || '-'}</div>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>
                    {po.due_date ? new Date(po.due_date).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge badge-${(po.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                    {po.status || 'Pending'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <POActions id={po.id} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No Purchase Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
