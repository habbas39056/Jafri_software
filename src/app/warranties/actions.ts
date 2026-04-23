'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getWarrantyInvoicables() {
  // Get Invoices that don't have a warranty yet
  return await prisma.invoice.findMany({
    where: {},
    include: {
      customer: true,
      po: true,
      items: {
        include: { product: true }
      }
    }
  });
}

export async function createWarranty(prevState: any, formData: FormData) {
  const invoice_id_str = formData.get('invoice_id') as string;
  const duration_years = parseInt(formData.get('duration_years') as string) || 1;
  const terms = formData.get('terms') as string;

  if (!invoice_id_str) {
    return { error: 'Please select an invoice.' };
  }

  const invoice_id = parseInt(invoice_id_str);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoice_id },
      include: { customer: true, po: true }
    });

    if (!invoice) throw new Error('Invoice not found.');

    const start_date = new Date();
    const end_date = new Date();
    end_date.setFullYear(start_date.getFullYear() + duration_years);

    // First create with a placeholder to get the ID
    const warranty = await prisma.warranty.create({
      data: {
        warranty_number: `PENDING-${Date.now()}`,
        customer_id: invoice.customer_id,
        invoice_id: invoice.id,
        po_id: invoice.po_id,
        start_date,
        end_date,
        status: 'Active',
        terms: terms || 'Standard 1 Year Warranty'
      }
    });

    // Then update with the actual sequential number
    await prisma.warranty.update({
      where: { id: warranty.id },
      data: {
        warranty_number: `W-${warranty.id}`
      }
    });

    revalidatePath('/warranties');
  } catch (error: any) {
    console.error('Warranty creation failed:', error);
    return { error: error.message || 'Failed to create warranty.' };
  }

  redirect('/warranties');
}
