'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCustomer(prevState: any, formData: FormData) {
  const customer_name = formData.get('customer_name') as string;
  const address = formData.get('address') as string;
  const ntn = formData.get('ntn') as string;
  const sales_tax_registration = formData.get('sales_tax_registration') as string;
  const vendor_code = formData.get('vendor_code') as string;
  const phone = formData.get('phone') as string;

  if (!customer_name) {
    return { error: 'Customer name is required' };
  }

  if (!vendor_code) {
    return { error: 'Vendor code is required' };
  }

  try {
    await prisma.customer.create({
      data: {
        customer_name,
        address,
        ntn,
        sales_tax_registration,
        vendor_code,
        phone,
      },
    });
  } catch (error) {
    return { error: 'Failed to create customer' };
  }

  revalidatePath('/customers');
  redirect('/customers');
}

export async function deleteCustomer(id: number) {
  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete customer' };
  }
}
