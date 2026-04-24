'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getUnpaidInvoices() {
  const { data, error } = await supabase
    .from('Invoice')
    .select('*, customer:Customer(*), po:PurchaseOrder(*)')
    .neq('status', 'Paid')
    .order('invoice_date', { ascending: false });

  if (error) {
    console.error('Error fetching unpaid invoices:', error);
    return [];
  }
  return data || [];
}

export async function createPayment(prevState: any, formData: FormData) {
  const invoice_id_str = formData.get('invoice_id') as string;
  const amount_paid_str = formData.get('amount_paid') as string;
  const payment_method = formData.get('payment_method') as string;
  const payment_date = formData.get('payment_date') as string;
  const remarks = formData.get('remarks') as string;

  if (!invoice_id_str || !amount_paid_str || !payment_method || !payment_date) {
    return { error: 'Please fill in all required fields.' };
  }

  const invoice_id = parseInt(invoice_id_str);
  const amount_paid = parseFloat(amount_paid_str);

  const { data: invoice, error: fetchError } = await supabase
    .from('Invoice')
    .select('*, payments:Payment(*)')
    .eq('id', invoice_id)
    .single();

  if (fetchError || !invoice) {
    return { error: 'Invoice not found.' };
  }

  // Calculate total paid including this one
  const payments = invoice.payments || [];
  const totalPaidSoFar = payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0);
  const newTotalPaid = totalPaidSoFar + amount_paid;

  // 1. Record the payment
  const { error: paymentError } = await supabase
    .from('Payment')
    .insert([
      {
        invoice_id,
        customer_id: invoice.customer_id,
        amount_paid,
        payment_method,
        payment_date: new Date(payment_date).toISOString(),
        wht_amount: parseFloat(formData.get('wht_amount') as string) || 0,
        retained_amount: parseFloat(formData.get('retained_amount') as string) || 0,
        ld_penalty: parseFloat(formData.get('ld_penalty') as string) || 0,
        remarks
      }
    ]);

  if (paymentError) {
    console.error('Payment failed:', paymentError);
    return { error: 'Failed to record payment.' };
  }

  // 2. Update invoice status if fully paid
  const newStatus = newTotalPaid >= invoice.total_amount ? 'Paid' : 'Partially Paid';
  await supabase
    .from('Invoice')
    .update({ status: newStatus })
    .eq('id', invoice_id);

  revalidatePath('/payments');
  revalidatePath('/invoices');
  redirect('/payments');
}
