'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPendingPurchaseOrders() {
  const { data, error } = await supabase
    .from('PurchaseOrder')
    .select('*, customer:Customer(*), items:POItem(*, product:Product(*)), production:ProductionTracking(*)')
    .neq('status', 'Completed');

  if (error) {
    console.error('Error fetching pending POs:', error);
    return [];
  }
  return data || [];
}

export async function createChallan(data: {
  gdn_number: string;
  po_id: number;
  customer_id: number;
  challan_date: string;
  items: { product_id: number; delivered_qty: number; remarks?: string }[];
}) {
  const { gdn_number, po_id, customer_id, challan_date, items } = data;

  if (!gdn_number || !po_id || !customer_id || items.length === 0) {
    return { error: 'Missing required fields' };
  }

  // 1. Create the Challan
  const { data: challan, error: challanError } = await supabase
    .from('Challan')
    .insert([
      {
        gdn_number,
        po_id,
        customer_id,
        challan_date: new Date(challan_date).toISOString(),
        status: 'Delivered',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (challanError || !challan) {
    console.error('Failed to create GDN:', challanError);
    return { error: 'Failed to create GDN' };
  }

  // 2. Create Challan Items
  const { error: itemsError } = await supabase
    .from('ChallanItem')
    .insert(
      items.map(item => ({
        challan_id: challan.id,
        product_id: item.product_id,
        delivered_qty: item.delivered_qty,
        remarks: item.remarks || ''
      }))
    );

  if (itemsError) {
    return { error: 'Failed to create GDN items' };
  }

  // 3. Update Production Tracking
  for (const item of items) {
    const { data: prodTracking, error: fetchError } = await supabase
      .from('ProductionTracking')
      .select('*')
      .eq('po_id', po_id)
      .eq('product_id', item.product_id)
      .single();

    if (prodTracking) {
      const newDelivered = prodTracking.delivered_qty + item.delivered_qty;
      const newPending = prodTracking.ordered_qty - newDelivered - prodTracking.rejected_qty;
      
      let newStatus = 'In Progress';
      if (newPending <= 0) {
        newStatus = 'Completed';
      }

      await supabase
        .from('ProductionTracking')
        .update({
          delivered_qty: newDelivered,
          pending_qty: newPending,
          status: newStatus,
          last_updated: new Date().toISOString()
        })
        .eq('id', prodTracking.id);
    }
  }

  // 4. Check if PO is completely delivered
  const { data: allTracking } = await supabase
    .from('ProductionTracking')
    .select('pending_qty')
    .eq('po_id', po_id);
    
  const allCompleted = allTracking?.every(t => t.pending_qty <= 0);
  
  if (allCompleted) {
    await supabase
      .from('PurchaseOrder')
      .update({ status: 'Completed' })
      .eq('id', po_id);
  }

  revalidatePath('/delivery');
  revalidatePath('/production');
  revalidatePath('/purchase-orders');
  redirect('/delivery');
}

export async function deleteChallan(id: number) {
  try {
    // 1. Delete Challan Items
    await supabase.from('ChallanItem').delete().eq('challan_id', id);
    
    // 2. Delete the Challan
    const { error } = await supabase.from('Challan').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/delivery');
    revalidatePath('/production');
    revalidatePath('/purchase-orders');
    return { success: true };
  } catch (error: any) {
    console.error('Delete challan error:', error);
    return { error: `Failed to delete delivery note: ${error.message}` };
  }
}
