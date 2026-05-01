import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import EditProductForm from './EditProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const { data: product, error } = await supabase
    .from('Product')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    notFound();
  }

  return <EditProductForm product={product} />;
}
