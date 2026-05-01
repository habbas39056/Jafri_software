'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(prevState: any, formData: FormData) {
  const product_name = formData.get('product_name') as string;
  const product_code = formData.get('product_code') as string;
  const unit_price_str = formData.get('unit_price') as string;
  const hs_code = formData.get('hs_code') as string;
  const imageFile = formData.get('image') as File;

  if (!product_name || !product_code || !unit_price_str) {
    return { error: 'All required fields must be filled' };
  }

  let image_url = '';
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Image upload failed: ${uploadError.message}. Make sure the 'product-images' bucket exists in Supabase Storage.` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    image_url = publicUrl;
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
        hs_code,
        image_url,
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

export async function updateProduct(id: number, prevState: any, formData: FormData) {
  const product_name = formData.get('product_name') as string;
  const product_code = formData.get('product_code') as string;
  const unit_price_str = formData.get('unit_price') as string;
  const hs_code = formData.get('hs_code') as string;
  const imageFile = formData.get('image') as File;
  const existing_image_url = formData.get('existing_image_url') as string;

  if (!product_name || !product_code || !unit_price_str) {
    return { error: 'All required fields must be filled' };
  }

  const unit_price = parseFloat(unit_price_str);
  if (isNaN(unit_price) || unit_price <= 0) {
    return { error: 'Invalid unit price' };
  }

  let image_url = existing_image_url;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Image upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    image_url = publicUrl;
  }

  const { error } = await supabase
    .from('Product')
    .update({
      product_name,
      product_code,
      unit_price,
      hs_code,
      image_url,
    })
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    if (error.code === '23505') {
      return { error: 'Failed to update product. Product code might already exist.' };
    }
    return { error: `Failed to update product: ${error.message}` };
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
