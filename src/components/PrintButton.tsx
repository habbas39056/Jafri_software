'use client';

import { Printer, Download } from 'lucide-react';
import { useEffect } from 'react';

export default function PrintButton({ 
  label = "Print Report", 
  autoPrint = false 
}: { 
  label?: string,
  autoPrint?: boolean
}) {
  const isDownload = label.toLowerCase().includes('download');

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      {isDownload ? <Download size={18} /> : <Printer size={18} />}
      {label}
    </button>
  );
}
