'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type POItemInput = {
  product_id: number;
  quantity: number;
  rate: number;
  total_amount: number;
};

export async function createPurchaseOrder(data: {
  po_number: string;
  customer_id: number;
  po_date: string;
  due_date: string;
  gst_percentage: number;
  items: POItemInput[];
}) {
  const { po_number, customer_id, po_date, due_date, gst_percentage, items } = data;

  if (!po_number || !customer_id || !po_date || !due_date || items.length === 0) {
    return { error: 'All fields and at least one item are required' };
  }

  // 1. Create the Purchase Order
  const { data: po, error: poError } = await supabase
    .from('PurchaseOrder')
    .insert([
      {
        po_number,
        customer_id,
        po_date: new Date(po_date).toISOString(),
        due_date: new Date(due_date).toISOString(),
        status: 'Pending',
        gst_percentage,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (poError || !po) {
    console.error('Failed to create PO:', poError);
    return { error: 'Failed to create Purchase Order. PO number might already exist.' };
  }

  // 2. Create PO Items
  const { error: itemsError } = await supabase
    .from('POItem')
    .insert(
      items.map(item => ({
        po_id: po.id,
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
        total_amount: item.total_amount
      }))
    );

  if (itemsError) {
    console.error('Failed to create items:', itemsError);
    return { error: 'Failed to create PO items' };
  }

  // 3. Create Production Tracking entries
  const productionData = items.map(item => ({
    po_id: po.id,
    product_id: item.product_id,
    ordered_qty: item.quantity,
    delivered_qty: 0,
    rejected_qty: 0,
    pending_qty: item.quantity,
    status: 'Pending'
  }));

  const { error: prodError } = await supabase
    .from('ProductionTracking')
    .insert(productionData);

  if (prodError) {
    console.error('Failed to create production tracking:', prodError);
    return { error: 'Failed to create production tracking' };
  }

  revalidatePath('/purchase-orders');
  revalidatePath('/production');
  redirect('/purchase-orders');
}

export async function deletePurchaseOrder(id: number) {
  try {
    // 1. Check for linked Invoices or Challans first (don't auto-delete these)
    const { count: invoiceCount } = await supabase.from('Invoice').select('*', { count: 'exact', head: true }).eq('po_id', id);
    const { count: challanCount } = await supabase.from('Challan').select('*', { count: 'exact', head: true }).eq('po_id', id);

    if ((invoiceCount || 0) > 0 || (challanCount || 0) > 0) {
      return { error: 'Cannot delete Purchase Order because it has linked Invoices or Delivery Notes. Delete those first.' };
    }

    // 2. Delete Child Records (Items and Tracking)
    await supabase.from('POItem').delete().eq('po_id', id);
    await supabase.from('ProductionTracking').delete().eq('po_id', id);
    
    // 3. Delete the PO
    const { error } = await supabase.from('PurchaseOrder').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/purchase-orders');
    revalidatePath('/production');
    return { success: true };
  } catch (error: any) {
    console.error('Delete PO error:', error);
    return { error: `Failed to delete Purchase Order: ${error.message}` };
  }
}
