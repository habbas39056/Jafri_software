'use server';

import { prisma } from '@/lib/prisma';
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

  try {
    await prisma.product.create({
      data: {
        product_name,
        product_code,
        unit_price,
      },
    });
  } catch (error) {
    return { error: 'Failed to create product. Product code might already exist.' };
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete product' };
  }
}
