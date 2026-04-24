import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Truck, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';

export default async function PODetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const { data: po, error } = await supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*), items:POItem(*, product:Product(*)), production:ProductionTracking(*), challans:Challan(*), invoices:Invoice(*)')
    .eq('id', id)
    .single();

  if (error || !po) {
    notFound();
  }


  if (!po) {
    notFound();
  }

  const grandTotal = po.items.reduce((sum: number, item: any) => sum + item.total_amount, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .web-only { display: none !important; }
          .print-only { display: block !important; }
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; max-width: 100% !important; }
          @page { margin: 0.5cm; size: landscape; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          .excel-po-form {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            width: 100%;
          }
          .excel-header {
            background-color: #ffcc66 !important;
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            padding: 4px;
            border: 1px solid #000;
            margin-bottom: 15px;
          }
          .excel-meta-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .meta-box {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .meta-row {
            display: flex;
          }
          .meta-label {
            background-color: #d9d9d9 !important;
            border: 1px solid #000;
            padding: 2px 5px;
            font-weight: bold;
            width: 100px;
          }
          .meta-value {
            border: 1px solid #000;
            border-left: none;
            padding: 2px 5px;
            color: #000080 !important;
            font-weight: bold;
            width: 250px;
            text-align: center;
          }
          .meta-right .meta-label {
            width: 80px;
          }
          .meta-right .meta-value {
            width: 120px;
          }
          .excel-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
          }
          .excel-table th {
            background-color: #d9d9d9 !important;
            border: 1px solid #000;
            padding: 4px;
            font-weight: bold;
            text-align: center;
          }
          .excel-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }
          .excel-table td:nth-child(2) {
            text-align: left;
            color: #000080 !important;
            font-weight: bold;
          }
          .total-row td {
            background-color: #ffcc66 !important;
            font-weight: bold;
          }
        }
      `}} />

      <div className="animate-fade-in web-only">
        <header className="header">
          <div className="page-title">
            <h1>Purchase Order Details</h1>
            <p>{po.po_number}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/purchase-orders" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <ArrowLeft size={18} />
              Back to List
            </Link>
            <PrintButton label="Print PO Form" />
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Customer Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Customer Name</p>
                <p style={{ fontWeight: 600 }}>{po.customer.customer_name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Vendor Code</p>
                <p>{po.customer.vendor_code || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>NTN / STRN</p>
                <p>{po.customer.ntn || 'N/A'} / {po.customer.sales_tax_registration || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Address</p>
                <p>{po.customer.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Order Summary
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Status</span>
                <span className={`badge badge-${po.status.toLowerCase().replace(' ', '-')}`}>{po.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Order Date</span>
                <span>{new Date(po.po_date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Due Date</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>{new Date(po.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Order Items</h2>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Rate (PKR)</th>
                  <th>Total Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.product.product_code}</td>
                    <td style={{ fontWeight: 600 }}>{item.product.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rate.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{item.total_amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, paddingRight: '1.5rem' }}>Grand Total</td>
                  <td style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>
                    {grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Production & Delivery Status</h2>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Ordered</th>
                  <th style={{ color: 'var(--success)' }}>Delivered</th>
                  <th style={{ color: 'var(--danger)' }}>Rejected</th>
                  <th style={{ color: 'var(--primary)' }}>Pending</th>
                  <th>Production Status</th>
                </tr>
              </thead>
              <tbody>
                {po.production.map((prod: any) => {
                  const product = po.items.find((i: any) => i.product_id === prod.product_id)?.product;
                  return (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{product?.product_name}</td>
                      <td>{prod.ordered_qty}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{prod.delivered_qty}</td>
                      <td style={{ color: 'var(--danger)' }}>{prod.rejected_qty}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{prod.pending_qty}</td>
                      <td>
                        <span className={`badge badge-${prod.status.toLowerCase().replace(' ', '-')}`}>
                          {prod.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="print-only" style={{ display: 'none' }}>
        <div className="excel-po-form">
          <div className="excel-header">PO ENTRY FORM</div>
          
          <div className="excel-meta-grid">
            <div className="meta-box meta-left">
              <div className="meta-row">
                <span className="meta-label">CUSTOMER</span>
                <span className="meta-value">{po.customer.customer_name}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">PO NUMBER</span>
                <span className="meta-value">{po.po_number}</span>
              </div>
            </div>
            
            <div className="meta-box meta-right">
              <div className="meta-row">
                <span className="meta-label">PO DATE</span>
                <span className="meta-value">{new Date(po.po_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">DUE DATE</span>
                <span className="meta-value">{new Date(po.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span>
              </div>
            </div>
          </div>

          <table className="excel-table">
            <thead>
              <tr>
                <th>S.NO.</th>
                <th>PRODUCT/ SERVICE</th>
                <th>CODE</th>
                <th>RATE</th>
                <th>QTY</th>
                <th>AMOUNT</th>
                <th>GST/SRB ({(po.gst_percentage || 18).toFixed(0)}%)</th>
                <th>NET</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item: any, index: number) => {
                const amount = item.total_amount;
                const gstRate = (po.gst_percentage || 18) / 100;
                const gst = amount * gstRate;
                const net = amount + gst;
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.product.product_name}</td>
                    <td>{item.product.product_code}</td>
                    <td>{item.rate}</td>
                    <td style={{ color: '#000080', fontWeight: 'bold' }}>{item.quantity}</td>
                    <td>{amount}</td>
                    <td>{gst}</td>
                    <td>{net}</td>
                  </tr>
                );
              })}
              {/* Fill empty rows up to 10 minimum for that excel look */}
              {Array.from({ length: Math.max(0, 10 - po.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td>{po.items.length + i + 1}</td>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: '10px' }}>Total</td>
                <td>{po.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</td>
                <td>{grandTotal}</td>
                <td>{grandTotal * ((po.gst_percentage || 18) / 100)}</td>
                <td>{grandTotal * (1 + ((po.gst_percentage || 18) / 100))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
