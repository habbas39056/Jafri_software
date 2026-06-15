'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, ShieldCheck } from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import { use, useEffect, useState } from 'react';
import { getWarranties, getCustomers, getInvoices, getPurchaseOrders, getChallans } from '@/lib/mockDb';

export default function WarrantyDetailsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }> | { id: string },
  searchParams: Promise<{ download?: string }> | { download?: string }
}) {
  const resolvedParams = use(params as Promise<{ id: string }>);
  const resolvedSearchParams = use(searchParams as Promise<{ download?: string }>);
  const id = parseInt(resolvedParams.id, 10);

  const [warranty, setWarranty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) return;

    const allWarranties = getWarranties();
    const w = allWarranties.find(x => x.id === id);

    if (w) {
      const allCustomers = getCustomers();
      const allInvoices = getInvoices();
      const allPOs = getPurchaseOrders();
      const allChallans = getChallans();

      const customer = allCustomers.find(c => c.id === w.customer_id);
      const invoice = allInvoices.find(i => i.id === w.invoice_id) || null;
      const challan = allChallans.find(c => c.id === w.challan_id) || null;
      const po = invoice ? allPOs.find(p => p.id === invoice.po_id) : (challan ? allPOs.find(p => p.id === challan.po_id) : null);

      setWarranty({
        ...w,
        customer,
        invoice: invoice ? { ...invoice, po } : null,
        challan,
        po
      });
    }

    setLoading(false);
  }, [id]);

  if (isNaN(id)) return notFound();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!warranty) return notFound();

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          .web-only { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 1cm; size: A4; }
          body { font-family: 'Times New Roman', Times, serif; color: black; background: white; }
          
          .warranty-letter {
            width: 100%;
            padding: 20px;
          }

          /* Reusable Company Header */
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
            font-family: Arial, sans-serif;
          }
          .company-name-large {
            font-size: 48px;
            font-weight: 900;
            color: #003366;
            letter-spacing: -1px;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .header-info-bar {
            background: #003366 !important;
            color: white !important;
            text-align: center;
            padding: 10px;
            font-size: 10pt;
            margin-bottom: 40px;
            line-height: 1.4;
            font-family: Arial, sans-serif;
          }

          .date-ref {
            text-align: right;
            margin-bottom: 30px;
            font-size: 12pt;
          }

          .recipient {
            margin-bottom: 40px;
            font-size: 12pt;
          }

          .subject {
            text-align: center;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 40px;
            font-size: 14pt;
          }

          .letter-body {
            font-size: 12pt;
            line-height: 1.6;
            margin-bottom: 40px;
          }

          .product-list-container {
            margin-top: 20px;
            text-align: center;
          }
          .product-list-header {
            color: #003366;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 15px;
          }
          .product-name {
            font-weight: bold;
            font-size: 16pt;
            text-transform: uppercase;
          }

          .disclaimer-box {
            border: 2px solid #006633;
            background: #e5e7eb !important;
            padding: 15px;
            margin-top: 40px;
            font-size: 11pt;
            line-height: 1.4;
          }

          .signature-section {
            margin-top: 60px;
            font-size: 12pt;
          }
        }
      `}} />

      <div className="animate-fade-in web-only">
        <header className="header">
          <div className="page-title">
            <h1>Warranty Certificate</h1>
            <p>{warranty.warranty_number}</p>
          </div>
          <div className="header-actions">
            <Link href="/warranties" className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <ArrowLeft size={18} />
              Back to List
            </Link>
            <PrintButton label="Download Warranty Letter" autoPrint={resolvedSearchParams.download === 'true'} />
          </div>
        </header>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
           <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <ShieldCheck size={64} color="var(--primary)" style={{ margin: '0 auto' }} />
              <h2 style={{ marginTop: '1rem' }}>Active Warranty</h2>
              <p style={{ color: '#64748b' }}>Issued for {warranty.customer.customer_name}</p>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>PO Reference</p>
                <p style={{ fontWeight: 600 }}>{warranty.po?.po_number || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Validity</p>
                <p style={{ fontWeight: 600 }}>Until {new Date(warranty.end_date).toLocaleDateString()}</p>
              </div>
           </div>
           
           <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Covered Items</p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '0.5rem' }}>
                {(warranty.invoice?.items || warranty.challan?.items || []).map((item: any, index: number) => (
                  <p key={item.id || item.product_id || index} style={{ fontWeight: 500 }}>• {item.product?.product_name || `Product ID ${item.product_id}`}</p>
                ))}
              </div>
           </div>

           <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
              <p><strong>Terms:</strong> {warranty.terms}</p>
           </div>
        </div>
      </div>

      <div className="print-only">
        <div className="warranty-letter">
          <div className="company-header">
            <div className="logo-circle">JC</div>
            <h1 className="company-name-large">JAFRI & CO.</h1>
          </div>
          <div className="header-info-bar">
            Tayyaba Market, 2B-20, Commercial Area, Nazimabad No.2, Karachi<br />
            Ph: +9221 36623689, Mob: +92370 6623689 Email: jafricompany@yahoo.com<br />
            NTN # 0669178-1 STN # 17-00-3900-081-64
          </div>

          <div className="date-ref">
            <p>Date: {new Date(warranty.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            {warranty.warranty_type === 'INV' ? (
              <p>Ref INV: {warranty.invoice?.invoice_number?.split('-')?.pop() || '-'}</p>
            ) : (
              <p>Ref GDN: {warranty.challan?.gdn_number || warranty.invoice?.po?.challans?.[0]?.gdn_number || '-'}</p>
            )}
          </div>

          <div className="recipient">
            <p>To</p>
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{warranty.customer.customer_name}</p>
          </div>

          <div className="subject">
            SUBJECT: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <u>PRODUCT WARRANTY</u>
          </div>

          <div className="letter-body">
            <p>The supply has been supplied against the P.O Number &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>{warranty.invoice?.po?.po_number || (warranty as any).po?.po_number || '0'}</strong></p>
            <p style={{ marginTop: '15px' }}>
              The Product(S) named with its/their sizes is/are under Warranty for {Math.round((new Date(warranty.end_date).getTime() - new Date(warranty.start_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} (one) 
              year by M/s. Jafri & Co. as follows.
            </p>
          </div>

          <div className="product-list-container">
            <div className="product-list-header">Product(s)/Service</div>
            {(warranty.invoice?.items || warranty.challan?.items || []).map((item: any, index: number) => (
              <div key={item.id || item.product_id || index} className="product-name">{item.product?.product_name || `Product ID ${item.product_id}`}</div>
            ))}
          </div>

          <div className="disclaimer-box">
            The Customer shall be solely responsible if the goods or products are misused 
            or treated improperly. Under its warranty, M/s. Jafri & Co. will not be able to 
            repair/replace it.
            <p style={{ marginTop: '15px' }}>Thanking you,</p>
            <p style={{ marginTop: '15px' }}>Regards,</p>
          </div>

          <div className="signature-section">
            <p>for: Jafri & Co.</p>
          </div>
        </div>
      </div>
    </>
  );
}
