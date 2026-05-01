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

export async function getWarrantyChallanables() {
  const { data, error } = await supabase
    .from('Challan')
    .select('*, customer:Customer(*), po:PurchaseOrder(*), items:ChallanItem(*, product:Product(*))');

  if (error) {
    console.error('Error fetching challanables:', error);
    return [];
  }
  return data || [];
}

export async function createWarranty(prevState: any, formData: FormData) {
  const type = formData.get('warranty_type') as string; // 'INV' or 'DC'
  const ref_id_str = formData.get('ref_id') as string;
  const duration_years = parseInt(formData.get('duration_years') as string) || 1;
  const terms = formData.get('terms') as string;

  if (!ref_id_str) {
    return { error: 'Please select an Invoice or DC.' };
  }

  const ref_id = parseInt(ref_id_str);
  let customer_id = 0;
  let po_id = 0;
  let invoice_id = null;
  let challan_id = null;

  if (type === 'INV') {
    const { data: invoice } = await supabase.from('Invoice').select('*').eq('id', ref_id).single();
    if (!invoice) return { error: 'Invoice not found.' };
    customer_id = invoice.customer_id;
    po_id = invoice.po_id;
    invoice_id = invoice.id;
  } else {
    const { data: challan } = await supabase.from('Challan').select('*').eq('id', ref_id).single();
    if (!challan) return { error: 'DC not found.' };
    customer_id = challan.customer_id;
    po_id = challan.po_id;
    challan_id = challan.id;
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
        customer_id,
        invoice_id,
        challan_id,
        po_id,
        warranty_type: type,
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
    return { error: `Failed to create warranty: ${createError?.message || 'Unknown error'}` };
  }

  // 2. Update with the actual sequential number
  await supabase
    .from('Warranty')
    .update({ warranty_number: `W-${warranty.id}` })
    .eq('id', warranty.id);

  revalidatePath('/warranties');
  redirect('/warranties');
}
