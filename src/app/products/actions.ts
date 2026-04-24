'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(prevState: any, formData: FormData) {
  const product_name = formData.get('product_name') as string;
  const product_code = formData.get('product_code') as string;
  const unit_price_str = formData.get('unit_price') as string;

  if (!product_name || !product_code || !unit_price_str) {
    return { error: 'All fields are required' };
  }

  const unit_price = parseFloat(unit_price_str);
  if (isNaN(unit_price) || unit_price <= 0) {
    return { error: 'Invalid unit price' };
  }

  const { error } = await supabase
    .from('Product')
    .insert([
      {
        product_name,
        product_code,
        unit_price,
      },
    ]);

  if (error) {
    console.error('Supabase error:', error);
    // If it's a unique constraint violation (error code 23505 in PostgreSQL)
    if (error.code === '23505') {
      return { error: 'Failed to create product. Product code might already exist.' };
    }
    return { error: `Failed to create product: ${error.message}` };
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('Product')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete product error:', error);
    if (error.code === '23503') {
      return { error: 'Cannot delete product because it is currently used in existing Purchase Orders, Invoices, or Delivery Challans.' };
    }
    return { error: `Failed to delete product: ${error.message}` };
  }

  revalidatePath('/products');
  return { success: true };
}
