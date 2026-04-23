'use client';

import { Printer, FileText } from 'lucide-react';

export default function InvoicePrintActions() {
  const handlePrint = (mode: 'standard' | 'tax') => {
    // Add mode class to body
    document.body.classList.remove('print-mode-standard', 'print-mode-tax');
    document.body.classList.add(`print-mode-${mode}`);
    
    // Print
    window.print();
    
    // Cleanup (optional, but good for UX if they stay on page)
    // Actually, it's better to keep it until they leave or print again
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button 
        className="btn" 
        onClick={() => handlePrint('standard')}
        style={{ background: 'white', border: '1px solid var(--border)' }}
      >
        <FileText size={18} /> Print Invoice
      </button>
      <button 
        className="btn btn-primary" 
        onClick={() => handlePrint('tax')}
      >
        <Printer size={18} /> Print Sales Tax Invoice
      </button>
    </div>
  );
}
