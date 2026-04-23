'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getInvoicablePOs() {
  // Get all POs that do not have an invoice yet.
  return await prisma.purchaseOrder.findMany({
    where: {
      invoices: {
        none: {}
      }
    },
    include: {
      customer: true,
      items: {
        include: { product: true }
      },
      deliveries: true
    }
  });
}

export async function createInvoice(prevState: any, data: any) {
  // data will likely be passed as a plain object since we might use a custom form
  // However, we can also handle FormData if we prefer.
  // Let's assume we receive a structured object for simplicity in complex forms.

  const { po_id, invoice_number, invoice_date, items, subtotal, gst_amount, total_amount, gst_percentage } = data;

  if (!po_id || !invoice_number || !invoice_date || !items || items.length === 0) {
    return { error: 'Missing required invoice data.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the PO and Customer
      const po = await tx.purchaseOrder.findUnique({
        where: { id: po_id },
        include: { customer: true }
      });

      if (!po) throw new Error('Purchase Order not found.');

      // 2. Create the Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoice_number,
          customer_id: po.customer_id,
          po_id: po_id,
          invoice_date: new Date(invoice_date),
          subtotal,
          gst_amount,
          total_amount,
          status: 'Unpaid',
          items: {
            create: items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount
            }))
          },
          sales_tax_info: {
            create: {
              gst_percentage,
              gst_amount,
              total_with_tax: total_amount
            }
          }
        }
      });

      return invoice;
    });

    revalidatePath('/invoices');
    revalidatePath('/purchase-orders');
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Invoice creation failed:', error);
    return { error: error.message || 'Failed to create invoice.' };
  }
}

export async function markAsPaid(id: number) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) throw new Error('Invoice not found');

    await prisma.$transaction([
      // 1. Update status
      prisma.invoice.update({
        where: { id },
        data: { status: 'Paid' }
      }),
      // 2. Record full payment
      prisma.payment.create({
        data: {
          invoice_id: id,
          customer_id: invoice.customer_id,
          amount_paid: invoice.total_amount,
          payment_method: 'Cash',
          payment_date: new Date(),
          remarks: 'Marked as paid via Quick Action'
        }
      })
    ]);

    revalidatePath('/invoices');
    revalidatePath('/payments');
    return { success: true };
  } catch (error) {
    console.error('Mark as paid failed:', error);
    return { error: 'Failed to update status' };
  }
}
