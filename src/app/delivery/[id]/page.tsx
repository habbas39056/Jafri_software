import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';

export default async function GDNDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const { data: challan, error } = await supabase
    .from('Challan')
    .select('*, customer:Customer(*), po:PurchaseOrder(*), items:ChallanItem(*, product:Product(*))')
    .eq('id', id)
    .single();

  if (error || !challan) {
    notFound();
  }


  if (!challan) {
    notFound();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .web-only { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 0.5cm; size: portrait; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white; color: black; margin: 0; }
          
          .gdn-print-form {
            font-family: Arial, sans-serif;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
          }
          .gdn-header-container {
            display: flex;
            align-items: center;
            padding: 10px 20px;
          }
          .gdn-logo-circle {
            width: 80px;
            height: 80px;
            border: 2px solid #003366;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #003366;
          }
          .gdn-logo-circle .jc {
            font-size: 32px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 2px;
          }
          .gdn-logo-circle .text {
            font-size: 8px;
            font-weight: bold;
          }
          .gdn-company-name {
            color: #002b5e;
            font-size: 56px;
            font-weight: 900;
            margin-left: 20px;
            letter-spacing: 1px;
          }
          .gdn-blue-banner {
            background-color: #002b5e !important;
            color: white !important;
            text-align: center;
            padding: 8px 10px;
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 25px;
          }
          .gdn-title-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .gdn-title {
            font-size: 20px;
            font-weight: bold;
            text-decoration: underline;
            text-underline-offset: 4px;
            text-decoration-thickness: 2px;
          }
          .gdn-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 0 10px;
          }
          .gdn-meta-left {
            width: 60%;
          }
          .gdn-meta-right {
            width: 35%;
          }
          .gdn-customer-name {
            font-size: 16px;
            font-weight: bold;
            margin: 5px 0 15px 0;
          }
          .gdn-po-box {
            border: 1px solid #000;
            padding: 4px 10px;
            min-height: 20px;
            width: 90%;
            margin-top: 2px;
            text-align: center;
          }
          .gdn-meta-table {
            width: 100%;
            font-size: 14px;
          }
          .gdn-meta-table td {
            padding: 4px 0;
          }
          .gdn-meta-table td:first-child {
            text-align: right;
            padding-right: 15px;
            width: 60%;
          }
          .gdn-meta-table td:last-child {
            font-weight: bold;
          }
          .gdn-items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 50px;
            font-size: 14px;
          }
          .gdn-items-table th {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            font-weight: bold;
          }
          .gdn-items-table td {
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            padding: 6px;
            text-align: center;
            height: 25px;
          }
          .gdn-items-table tr.odd {
            background-color: #e5e5e5 !important;
          }
          .gdn-items-table tr.even {
            background-color: white !important;
          }
          .gdn-items-table tr:last-child td {
            border-bottom: 1px solid #000;
          }
        }
      `}} />

      <div className="animate-fade-in web-only">
        <header className="header">
          <div className="page-title">
            <h1>Goods Delivery Note Details</h1>
            <p>{challan.gdn_number}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/delivery" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <ArrowLeft size={18} />
              Back to List
            </Link>
            <PrintButton label="Print Delivery Note" />
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Shipping To
            </h2>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{challan.customer.customer_name}</p>
            <p style={{ color: '#64748b' }}>{challan.customer.address || 'No address provided'}</p>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}><strong>Contact:</strong> {challan.customer.phone || 'N/A'}</p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Challan Details
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>GDN Number</span>
                <span style={{ fontWeight: 600 }}>{challan.gdn_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Purchase Order</span>
                <Link href={`/purchase-orders/${challan.po_id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {challan.po.po_number}
                </Link>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Delivery Date</span>
                <span>{new Date(challan.challan_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Delivered Items</h2>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Product Name</th>
                  <th>Product Code</th>
                  <th style={{ textAlign: 'right' }}>Quantity Delivered</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.product.product_name}</td>
                    <td>{item.product.product_code}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{item.delivered_qty} Units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="print-only" style={{ display: 'none' }}>
        <div className="gdn-print-form">
          <div className="gdn-header-container">
            <div className="gdn-logo-circle">
              <div className="jc">JC</div>
              <div className="text">JAFRI & CO.</div>
            </div>
            <div className="gdn-company-name">
              JAFRI & CO.
            </div>
          </div>
          
          <div className="gdn-blue-banner">
            Tayyaba Market, 2B-20, Commercial Area, Nazimabad No.2, Karachi<br/>
            Ph: +9221 36623689, Mob: +92370 6623689 Email: jafricompany@yahoo.com<br/>
            NTN # 0669178-1 STN # 17-00-3900-081-64
          </div>

          <div className="gdn-title-container">
            <span className="gdn-title">DELIVERY CHALLAN</span>
          </div>

          <div className="gdn-meta">
            <div className="gdn-meta-left">
              <div>M/s.</div>
              <div className="gdn-customer-name">{challan.customer.customer_name}</div>
              <div style={{ textAlign: 'center', width: '90%' }}>PO No.</div>
              <div className="gdn-po-box">
                {challan.po.po_number}
              </div>
            </div>
            <div className="gdn-meta-right">
              <table className="gdn-meta-table">
                <tbody>
                  <tr>
                    <td>Date:</td>
                    <td>{new Date(challan.challan_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</td>
                  </tr>
                  <tr>
                    <td>VENDOR NO.</td>
                    <td>{challan.customer.vendor_code || '-'}</td>
                  </tr>
                  <tr>
                    <td>DC NO.</td>
                    <td>{challan.gdn_number}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <table className="gdn-items-table">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>DESCRIPTION</th>
                <th style={{ width: '25%' }}>ITEM CODE</th>
                <th style={{ width: '20%' }}>QTY.</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item: any, index: number) => (
                <tr key={item.id} className={index % 2 === 0 ? "even" : "odd"}>
                  <td style={{ textAlign: 'left', paddingLeft: '15px' }}>{item.product.product_name}</td>
                  <td>{item.product.product_code || '-'}</td>
                  <td>{item.delivered_qty}</td>
                </tr>
              ))}
              {/* Padding empty alternating rows up to 15 rows total */}
              {Array.from({ length: Math.max(0, 15 - challan.items.length) }).map((_, i) => {
                const rowIndex = challan.items.length + i;
                return (
                  <tr key={`empty-${i}`} className={rowIndex % 2 === 0 ? "even" : "odd"}>
                    <td>&nbsp;</td>
                    <td></td>
                    <td></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
