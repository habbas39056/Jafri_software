import { prisma } from '@/lib/prisma';
import { Download, FileText, Printer } from 'lucide-react';
import PrintButton from '@/components/PrintButton';

export default async function ARSummaryReport() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      po: {
        include: { challans: true }
      },
      payments: true,
      deliveries: true
    },
    orderBy: { invoice_date: 'desc' }
  });

  const today = new Date();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Accounts Receivable (AR) Summary Report</h1>
          <p>Complete status of all invoices, payments, and deductions.</p>
        </div>
        <div className="header-actions">
          <PrintButton />
        </div>
      </header>

      <div className="card" style={{ overflowX: 'auto', padding: '0', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <table className="report-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '11px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ background: '#0f172a', color: 'white' }}>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, position: 'sticky', left: 0, background: '#0f172a', minWidth: '150px' }}>Customer</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '100px' }}>PO Reference</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '100px' }}>Inv. No</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '90px' }}>Date</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '90px' }}>Amount</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '80px' }}>GST</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '90px' }}>Total</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '80px' }}>DP No.</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '90px' }}>DP Date</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>Credit</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '90px' }}>Due Dt.</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>Aging</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, background: '#1e293b', minWidth: '100px' }}>Received</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'left', fontWeight: 600, minWidth: '90px' }}>Rcvd Dt.</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '90px' }}>WHT/IT</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '90px' }}>Retained</th>
              <th style={{ padding: '12px 8px', borderRight: '1px solid #334155', textAlign: 'right', fontWeight: 600, minWidth: '90px' }}>LD Penalty</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, background: '#059669', minWidth: '100px' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => {
              const totalReceived = inv.payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
              const totalWHT = inv.payments.reduce((sum, p) => sum + (p.wht_amount || 0), 0);
              const totalRetained = inv.payments.reduce((sum, p) => sum + (p.retained_amount || 0), 0);
              const totalLD = inv.payments.reduce((sum, p) => sum + (p.ld_penalty || 0), 0);
              const balance = inv.total_amount - totalReceived - totalWHT - totalRetained - totalLD;
              
              const lastPayment = inv.payments.length > 0 ? inv.payments[inv.payments.length - 1] : null;
              const challan = inv.po?.challans?.[0];
              const dueDate = new Date(inv.invoice_date);
              dueDate.setDate(dueDate.getDate() + 30);
              const overDueDays = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <tr key={inv.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background 0.2s' }}>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', position: 'sticky', left: 0, background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', fontWeight: 600 }}>{inv.customer.customer_name}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{inv.po.po_number}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#6366f1', fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{new Date(inv.invoice_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{inv.subtotal.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>{inv.gst_amount.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{inv.total_amount.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{challan?.gdn_number || '-'}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{challan ? new Date(challan.challan_date).toLocaleDateString('en-GB') : '-'}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>30 Days</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{dueDate.toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                    {overDueDays > 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 600, background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>{overDueDays}d</span>
                    ) : (
                      <span style={{ color: '#10b981' }}>Current</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#059669', fontWeight: 600, background: 'rgba(16, 185, 129, 0.05)' }}>{totalReceived.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{lastPayment ? new Date(lastPayment.payment_date).toLocaleDateString('en-GB') : '-'}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#f59e0b' }}>{totalWHT > 0 ? totalWHT.toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#6366f1' }}>{totalRetained > 0 ? totalRetained.toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#dc2626' }}>{totalLD > 0 ? totalLD.toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: balance > 0 ? '#dc2626' : '#059669', background: balance > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(5, 150, 105, 0.05)' }}>{balance.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
            <tr style={{ background: '#f1f5f9', fontWeight: 700, color: '#1e293b' }}>
              <td colSpan={4} style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1' }}>TOTALS</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1' }}>{invoices.reduce((s, i) => s + (i.subtotal || 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1' }}>{invoices.reduce((s, i) => s + (i.gst_amount || 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1' }}>{invoices.reduce((s, i) => s + (i.total_amount || 0), 0).toLocaleString()}</td>
              <td colSpan={5} style={{ borderTop: '2px solid #cbd5e1' }}></td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1', color: '#059669' }}>{invoices.reduce((s, i) => s + i.payments.reduce((p, c) => p + (c.amount_paid || 0), 0), 0).toLocaleString()}</td>
              <td style={{ borderTop: '2px solid #cbd5e1' }}></td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1', color: '#f59e0b' }}>{invoices.reduce((s, i) => s + i.payments.reduce((p, c) => p + (c.wht_amount || 0), 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1', color: '#6366f1' }}>{invoices.reduce((s, i) => s + i.payments.reduce((p, c) => p + (c.retained_amount || 0), 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1', color: '#dc2626' }}>{invoices.reduce((s, i) => s + i.payments.reduce((p, c) => p + (c.ld_penalty || 0), 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #cbd5e1', background: '#ecfdf5', color: '#059669' }}>
                {invoices.reduce((s, i) => s + (i.total_amount - i.payments.reduce((p, c) => p + (c.amount_paid || 0) + (c.wht_amount || 0) + (c.retained_amount || 0) + (c.ld_penalty || 0), 0)), 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @media print {
          @page { size: landscape; margin: 5mm; }
          .header, .sidebar, .btn, .header-actions { display: none !important; }
          body { padding: 0 !important; margin: 0 !important; background: white !important; -webkit-print-color-adjust: exact; font-family: 'Inter', sans-serif; }
          .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .report-table { width: 100% !important; table-layout: auto !important; font-size: 7px !important; border-collapse: collapse !important; border: 0.5pt solid #000 !important; }
          .report-table th, .report-table td { 
            padding: 3px 2px !important; 
            border: 0.1pt solid #000 !important; 
            word-break: break-all !important;
            overflow: visible !important;
            position: static !important;
            background: transparent !important;
            min-width: 0 !important; /* Allow shrinking in print */
          }
          .report-table thead tr { background: #f0f0f0 !important; color: #000 !important; font-weight: bold !important; }
          .report-table tfoot tr { background: #f9f9f9 !important; font-weight: bold !important; }
          .report-table th { background: #f0f0f0 !important; text-transform: uppercase; font-size: 6px !important; }
          .report-table td { color: #000 !important; }
          .report-table thead, .report-table tfoot { position: static !important; }
          tr { page-break-inside: avoid !important; }
          
          /* Force hide sticky column behavior in print */
          .report-table th:first-child, 
          .report-table td:first-child { 
            position: static !important; 
            background: transparent !important; 
            width: auto !important;
          }
        }
      `}} />
    </div>
  );
}
