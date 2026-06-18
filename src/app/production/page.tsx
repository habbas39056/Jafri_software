'use client';

import { useState, useEffect, use } from 'react';
import { Factory, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import UpdateProductionBtn from '@/components/UpdateProductionBtn';
import ProductionSearch from '@/components/ProductionSearch';
import { getCustomers, Customer } from '@/lib/mockDb';

export default function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; customer?: string; status?: string }> | { q?: string; customer?: string; status?: string };
}) {
  const resolvedSearchParams = searchParams instanceof Promise ? use(searchParams as Promise<any>) : searchParams;
  const query = resolvedSearchParams?.q || '';
  const customerId = resolvedSearchParams?.customer || '';
  const status = resolvedSearchParams?.status || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tracking, setTracking] = useState<any[]>([]);

  useEffect(() => {
    // Fetch customers for filter
    const custData = getCustomers();
    setCustomers(custData);

    // Provide mock tracking data
    let trackData = [
      { id: '1', po: { po_number: 'PO-2026-9021', customer: { customer_name: 'Acme Corp' }, po_date: '2026-06-01' }, product: { product_name: 'Industrial Widget A', product_code: 'IW-A-001' }, qty: 500, delivered_qty: 100, rejected_qty: 0, pending_qty: 400, due_date: '2026-06-15', status: 'In Production' },
      { id: '2', po: { po_number: 'PO-2026-9022', customer: { customer_name: 'Stark Industries' }, po_date: '2026-05-28' }, product: { product_name: 'Arc Reactor Core', product_code: 'ARC-001' }, qty: 10, delivered_qty: 0, rejected_qty: 0, pending_qty: 10, due_date: '2026-06-20', status: 'Pending' },
      { id: '3', po: { po_number: 'PO-2026-9023', customer: { customer_name: 'Wayne Enterprises' }, po_date: '2026-05-25' }, product: { product_name: 'Kevlar Plating', product_code: 'KV-PL-02' }, qty: 1000, delivered_qty: 1000, rejected_qty: 5, pending_qty: 0, due_date: '2026-06-10', status: 'Completed' },
    ];

    if (query) {
      const q = query.toLowerCase();
      trackData = trackData.filter(t => t.po.po_number.toLowerCase().includes(q) || t.product.product_name.toLowerCase().includes(q));
    }
    if (customerId) {
      const custName = custData.find(c => c.id.toString() === customerId)?.customer_name;
      if (custName) {
        trackData = trackData.filter(t => t.po.customer.customer_name === custName);
      }
    }
    if (status) {
      trackData = trackData.filter(t => t.status === status);
    }

    setTracking(trackData);
  }, [query, customerId, status]);

  return (
    <div className="animate-fade-in">
      <header className="header">
        <div className="page-title">
          <h1>Production Tracking</h1>
          <p>Monitor manufacturing progress and pending quantities.</p>
        </div>
      </header>

      <ProductionSearch customers={customers} />

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending Production</h3>
            <p>{tracking.reduce((acc, t) => acc + t.pending_qty, 0)} Units</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>Delivered</h3>
            <p>{tracking.reduce((acc, t) => acc + t.delivered_qty, 0)} Units</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p>{tracking.reduce((acc, t) => acc + t.rejected_qty, 0)} Units</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr style={{ background: '#4472c4', color: 'white' }}>
              <th style={{ color: 'white', padding: '10px' }}>CUSTOMER</th>
              <th style={{ color: 'white', padding: '10px' }}>PO NO.</th>
              <th style={{ color: 'white', padding: '10px' }}>PROD/SERVICE</th>
              <th style={{ color: 'white', padding: '10px' }}>CODE</th>
              <th style={{ color: 'white', padding: '10px' }}>QTY</th>
              <th style={{ color: 'white', padding: '10px' }}>PO Dt</th>
              <th style={{ color: 'white', padding: '10px' }}>DUE Dt</th>
              <th style={{ color: 'white', padding: '10px' }}>DLVRED</th>
              <th style={{ color: 'white', padding: '10px' }}>REJCTD</th>
              <th style={{ color: 'white', padding: '10px' }}>PENDING</th>
              <th style={{ color: 'white', padding: '10px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {tracking.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.po.customer.customer_name}</td>
                <td style={{ color: '#000080', fontWeight: 600 }}>{item.po.po_number}</td>
                <td>{item.product.product_name}</td>
                <td>{item.product.product_code}</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.ordered_qty}</td>
                <td>{new Date(item.po.po_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                <td>{new Date(item.po.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>{item.delivered_qty}</td>
                <td style={{ color: 'var(--danger)', textAlign: 'center' }}>{item.rejected_qty}</td>
                <td style={{ color: 'var(--primary)', fontWeight: 700, textAlign: 'center' }}>{item.pending_qty}</td>
                <td style={{ textAlign: 'center' }}>
                  <UpdateProductionBtn tracking={{
                    id: item.id,
                    ordered_qty: item.ordered_qty,
                    delivered_qty: item.delivered_qty,
                    rejected_qty: item.rejected_qty,
                    product_name: item.product.product_name,
                    po_number: item.po.po_number
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
