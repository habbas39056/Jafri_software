'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getWarrantyInvoicables() {
  const { data, error } = await supabase
    .from('Invoice')
    .select('*, customer:Customer(*), po:PurchaseOrder(*), items:InvoiceItem(*, product:Product(*))');

  if (error) {
    console.error('Error fetching invoicables:', error);
    return [];
  }
  return data || [];
}

export async function createWarranty(prevState: any, formData: FormData) {
  const invoice_id_str = formData.get('invoice_id') as string;
  const duration_years = parseInt(formData.get('duration_years') as string) || 1;
  const terms = formData.get('terms') as string;

  if (!invoice_id_str) {
    return { error: 'Please select an invoice.' };
  }

  const invoice_id = parseInt(invoice_id_str);

  const { data: invoice, error: fetchError } = await supabase
    .from('Invoice')
    .select('*, customer:Customer(*), po:PurchaseOrder(*)')
    .eq('id', invoice_id)
    .single();

  if (fetchError || !invoice) {
    return { error: 'Invoice not found.' };
  }

  const start_date = new Date();
  const end_date = new Date();
  end_date.setFullYear(start_date.getFullYear() + duration_years);

  // 1. Create with a placeholder
  const { data: warranty, error: createError } = await supabase
    .from('Warranty')
    .insert([
      {
        warranty_number: `PENDING-${Date.now()}`,
        customer_id: invoice.customer_id,
        invoice_id: invoice.id,
        po_id: invoice.po_id,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        status: 'Active',
        terms: terms || 'Standard 1 Year Warranty'
      }
    ])
    .select()
    .single();

  if (createError || !warranty) {
    console.error('Warranty creation failed:', createError);
    return { error: 'Failed to create warranty.' };
  }

  // 2. Update with the actual sequential number
  await supabase
    .from('Warranty')
    .update({ warranty_number: `W-${warranty.id}` })
    .eq('id', warranty.id);

  revalidatePath('/warranties');
  redirect('/warranties');
}
