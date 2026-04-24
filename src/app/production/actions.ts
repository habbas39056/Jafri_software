'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateProductionTracking(id: number, data: {
  delivered_qty: number;
  rejected_qty: number;
}) {
  try {
    const { data: tracking, error: fetchError } = await supabase
      .from('ProductionTracking')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !tracking) {
      return { error: 'Tracking record not found' };
    }

    const pending_qty = tracking.ordered_qty - data.delivered_qty - data.rejected_qty;
    
    let status = 'In Progress';
    if (pending_qty <= 0) {
      status = 'Completed';
    } else if (data.delivered_qty === 0 && data.rejected_qty === 0) {
      status = 'Pending';
    }

    const { error: updateError } = await supabase
      .from('ProductionTracking')
      .update({
        delivered_qty: data.delivered_qty,
        rejected_qty: data.rejected_qty,
        pending_qty: pending_qty,
        status: status,
        last_updated: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return { error: 'Failed to update production' };
    }

    revalidatePath('/production');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update production:', error);
    return { error: error.message || 'Failed to update production' };
  }
}
