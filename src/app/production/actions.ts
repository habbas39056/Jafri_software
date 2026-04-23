'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProductionTracking(id: number, data: {
  delivered_qty: number;
  rejected_qty: number;
}) {
  try {
    const tracking = await prisma.productionTracking.findUnique({
      where: { id }
    });

    if (!tracking) {
      return { error: 'Tracking record not found' };
    }

    const pending_qty = tracking.ordered_qty - data.delivered_qty - data.rejected_qty;
    
    let status = 'In Progress';
    if (pending_qty <= 0) {
      status = 'Completed';
    } else if (data.delivered_qty === 0 && data.rejected_qty === 0) {
      status = 'Pending';
    }

    await prisma.productionTracking.update({
      where: { id },
      data: {
        delivered_qty: data.delivered_qty,
        rejected_qty: data.rejected_qty,
        pending_qty: pending_qty,
        status: status,
        last_updated: new Date()
      }
    });

    revalidatePath('/production');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update production:', error);
    return { error: error.message || 'Failed to update production' };
  }
}
