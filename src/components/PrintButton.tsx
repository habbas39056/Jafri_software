'use client';

import { Printer } from 'lucide-react';

export default function PrintButton({ label = "Print Report" }: { label?: string }) {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <Printer size={18} />
      {label}
    </button>
  );
}
