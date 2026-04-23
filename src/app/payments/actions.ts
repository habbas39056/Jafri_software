'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getUnpaidInvoices() {
  return await prisma.invoice.findMany({
    where: {
      status: {
        not: 'Paid'
      }
    },
    include: {
      customer: true,
      po: true
    },
    orderBy: {
      invoice_date: 'desc'
    }
  });
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

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoice_id },
      include: { payments: true }
    });

    if (!invoice) throw new Error('Invoice not found.');

    // Calculate total paid including this one
    const totalPaidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const newTotalPaid = totalPaidSoFar + amount_paid;

    await prisma.$transaction(async (tx) => {
      // 1. Record the payment
      await tx.payment.create({
        data: {
          invoice_id,
          customer_id: invoice.customer_id,
          amount_paid,
          payment_method,
          payment_date: new Date(payment_date),
          wht_amount: parseFloat(formData.get('wht_amount') as string) || 0,
          retained_amount: parseFloat(formData.get('retained_amount') as string) || 0,
          ld_penalty: parseFloat(formData.get('ld_penalty') as string) || 0,
          remarks
        }
      });

      // 2. Update invoice status if fully paid
      if (newTotalPaid >= invoice.total_amount) {
        await tx.invoice.update({
          where: { id: invoice_id },
          data: { status: 'Paid' }
        });
      } else {
        await tx.invoice.update({
          where: { id: invoice_id },
          data: { status: 'Partially Paid' }
        });
      }
    });

    revalidatePath('/payments');
    revalidatePath('/invoices');
  } catch (error: any) {
    console.error('Payment failed:', error);
    return { error: error.message || 'Failed to record payment.' };
  }

  redirect('/payments');
}
