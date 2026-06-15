'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import InvoiceStatusActions from '@/components/InvoiceStatusActions';
import InvoicePrintActions from '@/components/InvoicePrintActions';
import { getInvoices, getCustomers, getPurchaseOrders, getProducts, getChallans } from '@/lib/mockDb';

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = parseInt(resolvedParams.id, 10);
  const [invoice, setInvoice] = useState<any | null>(null);

  useEffect(() => {
    const allInvoices = getInvoices();
    const allCustomers = getCustomers();
    const allPos = getPurchaseOrders();
    const allProducts = getProducts();
    const allChallans = getChallans();

    const currentInvoice = allInvoices.find(inv => inv.id === id);
    if (currentInvoice) {
      const po = allPos.find(p => p.id === currentInvoice.po_id) || { po_number: 'Unknown' };
      setInvoice({
        ...currentInvoice,
        customer: allCustomers.find(c => c.id === currentInvoice.customer_id) || { customer_name: 'Unknown', address: '', ntn: '', sales_tax_registration: '', vendor_code: '' },
        po: {
          ...po,
          challans: allChallans.filter(c => c.po_id === currentInvoice.po_id)
        },
        items: ((po as any).items || []).map((item: any) => ({
          ...item,
          amount: item.total_amount || (item.quantity * item.rate),
          product: allProducts.find(p => p.id === item.product_id) || { product_name: 'Unknown', product_code: '' }
        })),
        sales_tax_info: { gst_percentage: (currentInvoice as any).gst_percentage || 18 }
      });
    }
  }, [id]);

  if (!invoice) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Invoice Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested Invoice could not be loaded.</p>
        <Link href="/invoices" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to Invoices</Link>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .web-only { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 0.5cm; size: A4; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: black; background: white; }
          
          .tax-invoice-layout, .standard-invoice-layout { display: none !important; }
          body.print-mode-tax .tax-invoice-layout { display: block !important; }
          body.print-mode-standard .standard-invoice-layout { display: block !important; }

          .invoice-print {
            width: 100%;
            color: #000;
          }

          /* Header Styles */
          .company-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 5px;
          }
          .logo-circle {
            width: 80px;
            height: 80px;
            border: 4px solid #003366;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 32px;
            color: #003366;
          }
          .company-name-large {
            font-size: 48px;
            font-weight: 900;
            color: #003366;
            letter-spacing: -1px;
            margin: 0;
          }
          .header-info-bar {
            background: #003366 !important;
            color: white !important;
            text-align: center;
            padding: 10px;
            font-size: 10pt;
            margin-bottom: 15px;
            line-height: 1.4;
          }

          /* Title */
          .invoice-title-main {
            text-align: center;
            font-size: 24pt;
            font-weight: bold;
            margin: 10px 0 20px 0;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }

          /* Info Grid */
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11pt;
          }
          .info-box table { border-collapse: collapse; }
          .info-box td { padding: 2px 5px; vertical-align: top; }
          .info-label { font-weight: bold; width: 100px; }

          /* Table Styles */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
          }
          .print-table th {
            background: #003366 !important;
            color: white !important;
            border: 1px solid #000;
            padding: 8px 5px;
            font-size: 10pt;
            text-transform: uppercase;
          }
          .print-table td {
            border: 1px solid #000;
            padding: 6px 5px;
            font-size: 10pt;
            min-height: 400px;
          }
          .items-body { min-height: 400px; }

          /* Footer Styles */
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 0;
          }
          .totals-box {
            width: 40%;
            background: #e5e7eb !important;
            padding: 15px;
            margin-top: 10px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12pt;
          }
          .grand-total-row {
            border-top: 1px solid #000;
            margin-top: 5px;
            padding-top: 5px;
            font-weight: bold;
            font-size: 14pt;
          }

          .amount-in-words {
            margin-top: 20px;
            font-size: 11pt;
          }
          .amount-in-words span {
            font-weight: bold;
            text-decoration: underline;
          }
        }
      `}} />

      <div className="animate-fade-in web-only">
        <header className="header">
          <div className="page-title">
            <h1>Invoice Details</h1>
            <p>{invoice.invoice_number}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/invoices" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <ArrowLeft size={18} />
              Back to List
            </Link>
            <InvoiceStatusActions id={invoice.id} status={invoice.status} />
            <InvoicePrintActions />
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Billed To
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</p>
                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{invoice.customer.customer_name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vendor Code</p>
                <p>{invoice.customer.vendor_code || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Address</p>
                <p>{invoice.customer.address || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>NTN</p>
                <p>{invoice.customer.ntn || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>STRN</p>
                <p>{invoice.customer.sales_tax_registration || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Payment Info
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status</span>
                <span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Invoice Date</span>
                <span style={{ fontWeight: 600 }}>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>PO Ref</span>
                <Link href={`/purchase-orders/${invoice.po_id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {invoice.po.po_number}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Invoice Items</h2>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr key={item.id || item.product_id || index}>
                    <td>{item.product.product_code}</td>
                    <td style={{ fontWeight: 600 }}>{item.product.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rate.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <div style={{ width: '350px', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span>PKR {invoice.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>GST ({invoice.sales_tax_info?.gst_percentage || 18}%)</span>
                <span>PKR {invoice.gst_amount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Total Amount</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>PKR {invoice.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-only" style={{ display: 'none' }}>
        {/* NORMAL INVOICE LAYOUT (Image 1) */}
        <div className="invoice-print standard-invoice-layout">
          <div className="invoice-title-main" style={{ border: 'none', fontSize: '28pt' }}>INVOICE</div>
          
          <div className="info-section">
            <div className="info-box">
              <table>
                <tbody>
                  <tr><td className="info-label">Customer</td><td>: <strong>{invoice.customer.customer_name}</strong></td></tr>
                  <tr><td className="info-label">Address</td><td>: {invoice.customer.address}</td></tr>
                  <tr><td className="info-label">NTN</td><td>: {invoice.customer.ntn}</td></tr>
                  <tr><td className="info-label">STN</td><td>: {invoice.customer.sales_tax_registration}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <table>
                <tbody>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Date</td><td>: {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Invoice No.</td><td>: {invoice.invoice_number.replace('INV-', '')}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Vendor No.</td><td>: {invoice.customer.vendor_code}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>PO No.</td><td>: {invoice.po.po_number}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>SrNo</th>
                <th style={{ width: '100px' }}>Item Code</th>
                <th>Product Name</th>
                <th style={{ width: '80px' }}>DC No.</th>
                <th style={{ width: '60px' }}>QTY</th>
                <th style={{ width: '100px' }}>RATE</th>
                <th style={{ width: '100px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, index: number) => (
                <tr key={item.id || item.product_id || index}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ textAlign: 'center' }}>{item.product.product_code}</td>
                  <td>{item.product.product_name}</td>
                  <td style={{ textAlign: 'center' }}>{(invoice.po as any).challans?.[0]?.gdn_number?.split('-')?.pop() || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 15 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ height: '30px' }}>&nbsp;</td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-section">
            <div className="totals-box">
              <div className="totals-row">
                <span>SUB TOTAL:</span>
                <span>{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="totals-row">
                <span>GST:</span>
                <span>{invoice.gst_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span>GRAND TOTAL:</span>
                <span>{invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SALES TAX INVOICE LAYOUT (Image 2) */}
        <div className="invoice-print tax-invoice-layout">
          <div className="company-header">
            <div className="logo-circle">JC</div>
            <h1 className="company-name-large">JAFRI & CO.</h1>
          </div>
          <div className="header-info-bar">
            Tayyaba Market, 2B-20, Commercial Area, Nazimabad No.2, Karachi<br />
            Ph: +9221 36623689, Mob: +92370 6623689 Email: jafricompany@yahoo.com<br />
            NTN # 0669178-1 STN # 17-00-3900-081-64
          </div>

          <div className="invoice-title-main" style={{ fontSize: '18pt', border: 'none' }}>SALES TAX INVOICE</div>

          <div className="info-section">
            <div className="info-box">
              <table>
                <tbody>
                  <tr><td className="info-label">Customer</td><td>: <strong>{invoice.customer.customer_name}</strong></td></tr>
                  <tr><td className="info-label">Address</td><td>: {invoice.customer.address}</td></tr>
                  <tr><td className="info-label">NTN</td><td>: {invoice.customer.ntn}</td></tr>
                  <tr><td className="info-label">STN</td><td>: {invoice.customer.sales_tax_registration}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <table>
                <tbody>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Date</td><td>: {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Invoice No.</td><td>: {invoice.invoice_number.replace('INV-', '')}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>Vendor No.</td><td>: {invoice.customer.vendor_code}</td></tr>
                  <tr><td className="info-label" style={{textAlign: 'right'}}>PO No.</td><td>: {invoice.po.po_number}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Sr No.</th>
                <th style={{ width: '70px' }}>Quantity</th>
                <th style={{ width: '80px' }}>Unit Price</th>
                <th>Description of Goods</th>
                <th style={{ width: '100px' }}>Value Excluding Sales Tax</th>
                <th style={{ width: '100px' }}>Amount of Sales Tax {invoice.sales_tax_info?.gst_percentage || 18}%</th>
                <th style={{ width: '100px' }}>Total Including Sales Tax</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, index: number) => (
                <tr key={item.id || item.product_id || index}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center' }}>{item.rate.toLocaleString()}</td>
                  <td>{item.product.product_name}</td>
                  <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right' }}>{(item.amount * (invoice.sales_tax_info?.gst_percentage || 18) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right' }}>{(item.amount * (1 + (invoice.sales_tax_info?.gst_percentage || 18) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {/* Table Footer Total Row */}
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ borderRight: 'none' }}>Total</td>
                <td style={{ textAlign: 'center' }}>{invoice.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</td>
                <td style={{ borderLeft: 'none' }} colSpan={2}></td>
                <td style={{ textAlign: 'right' }}>{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                <td style={{ textAlign: 'right' }}>{invoice.gst_amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}</td>
                <td style={{ textAlign: 'right' }}>{invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}</td>
              </tr>
              {Array.from({ length: Math.max(0, 10 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ height: '30px' }}>&nbsp;</td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: '#e5e7eb', padding: '15px', marginTop: '15px', textAlign: 'center', fontSize: '14pt', fontWeight: 'bold' }}>
            GRAND TOTAL: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>

          <div className="amount-in-words">
            Amount in Words &nbsp;&nbsp;&nbsp; <span>Rupees {invoice.total_amount.toLocaleString()} Only</span>
          </div>
        </div>
      </div>
    </>
  );
}
