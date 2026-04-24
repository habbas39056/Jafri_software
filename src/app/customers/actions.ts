'use server';

import { supabase } from '@/lib/supabase';
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

  const { error } = await supabase
    .from('Customer')
    .insert([
      {
        customer_name,
        address,
        ntn,
        sales_tax_registration,
        vendor_code,
        phone,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Supabase error:', error);
    return { error: `Failed to create customer: ${error.message}` };
  }

  revalidatePath('/customers');
  redirect('/customers');
}

export async function deleteCustomer(id: number) {
  const { error } = await supabase
    .from('Customer')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete customer error:', error);
    if (error.code === '23503') {
      return { error: 'Cannot delete customer because they have active Purchase Orders, Invoices, or Delivery Challans linked to them.' };
    }
    return { error: `Failed to delete customer: ${error.message}` };
  }
  
  revalidatePath('/customers');
  return { success: true };
}
