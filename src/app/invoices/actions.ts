'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getInvoicablePOs() {
  // Get all POs and their invoices
  const { data: pos, error } = await supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*), items:POItem(*, product:Product(*)), challans:Challan(*), invoices:Invoice(id)');

  if (error) {
    console.error('Error fetching POs:', error);
    return [];
  }

  // Filter for POs that do not have an invoice yet
  return (pos || []).filter(po => !po.invoices || po.invoices.length === 0);
}

export async function createInvoice(prevState: any, data: any) {
  const { po_id, invoice_number, invoice_date, items, subtotal, gst_amount, total_amount, gst_percentage } = data;

  if (!po_id || !invoice_number || !invoice_date || !items || items.length === 0) {
    return { error: 'Missing required invoice data.' };
  }

  // 1. Get the PO to find customer_id
  const { data: po, error: poFetchError } = await supabase
    .from('PurchaseOrder')
    .select('customer_id')
    .eq('id', po_id)
    .single();

  if (poFetchError || !po) {
    return { error: 'Purchase Order not found.' };
  }

  // 2. Create the Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('Invoice')
    .insert([
      {
        invoice_number,
        customer_id: po.customer_id,
        po_id: po_id,
        invoice_date: new Date(invoice_date).toISOString(),
        subtotal,
        gst_amount,
        total_amount,
        status: 'Unpaid',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (invoiceError || !invoice) {
    console.error('Invoice creation failed:', invoiceError);
    return { error: 'Failed to create invoice.' };
  }

  // 3. Create Invoice Items
  const { error: itemsError } = await supabase
    .from('InvoiceItem')
    .insert(
      items.map((item: any) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      }))
    );

  if (itemsError) {
    console.error('Failed to create items:', itemsError);
    return { error: 'Failed to create invoice items' };
  }

  // 4. Create Sales Tax Info
  const { error: taxError } = await supabase
    .from('SalesTaxInvoice')
    .insert([
      {
        invoice_id: invoice.id,
        gst_percentage,
        gst_amount,
        total_with_tax: total_amount
      }
    ]);

  if (taxError) {
    console.error('Failed to create sales tax info:', taxError);
    return { error: 'Failed to create sales tax info' };
  }

  revalidatePath('/invoices');
  revalidatePath('/purchase-orders');
  return { success: true, id: invoice.id };
}

export async function markAsPaid(id: number) {
  const { data: invoice, error: fetchError } = await supabase
    .from('Invoice')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !invoice) {
    return { error: 'Invoice not found' };
  }

  // 1. Update status
  const { error: updateError } = await supabase
    .from('Invoice')
    .update({ status: 'Paid' })
    .eq('id', id);

  if (updateError) {
    return { error: 'Failed to update status' };
  }

  // 2. Record full payment
  const { error: paymentError } = await supabase
    .from('Payment')
    .insert([
      {
        invoice_id: id,
        customer_id: invoice.customer_id,
        amount_paid: invoice.total_amount,
        payment_method: 'Cash',
        payment_date: new Date().toISOString(),
        remarks: 'Marked as paid via Quick Action'
      }
    ]);

  if (paymentError) {
    console.error('Payment record failed:', paymentError);
    return { error: 'Failed to record payment' };
  }

  revalidatePath('/invoices');
  revalidatePath('/payments');
  return { success: true };
}

export async function deleteInvoice(id: number) {
  try {
    // 1. Delete Sales Tax Info
    await supabase.from('SalesTaxInvoice').delete().eq('invoice_id', id);
    
    // 2. Delete Invoice Items
    await supabase.from('InvoiceItem').delete().eq('invoice_id', id);
    
    // 3. Delete any payments linked to this invoice
    await supabase.from('Payment').delete().eq('invoice_id', id);
    
    // 4. Finally delete the Invoice
    const { error } = await supabase.from('Invoice').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/invoices');
    revalidatePath('/payments');
    return { success: true };
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return { error: `Failed to delete invoice: ${error.message}` };
  }
}
