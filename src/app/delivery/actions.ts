'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPendingPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({
    where: {
      status: {
        not: 'Completed'
      }
    },
    include: {
      customer: true,
      items: {
        include: { product: true }
      },
      production: true
    }
  });
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

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the Challan
      const challan = await tx.challan.create({
        data: {
          gdn_number,
          po_id,
          customer_id,
          challan_date: new Date(challan_date),
          status: 'Delivered',
          items: {
            create: items.map(item => ({
              product_id: item.product_id,
              delivered_qty: item.delivered_qty,
              remarks: item.remarks || ''
            }))
          }
        }
      });

      // 2. Update Production Tracking
      for (const item of items) {
        const prodTracking = await tx.productionTracking.findFirst({
          where: { po_id, product_id: item.product_id }
        });

        if (prodTracking) {
          const newDelivered = prodTracking.delivered_qty + item.delivered_qty;
          const newPending = prodTracking.ordered_qty - newDelivered - prodTracking.rejected_qty;
          
          let newStatus = 'In Progress';
          if (newPending <= 0) {
            newStatus = 'Completed';
          }

          await tx.productionTracking.update({
            where: { id: prodTracking.id },
            data: {
              delivered_qty: newDelivered,
              pending_qty: newPending,
              status: newStatus,
              last_updated: new Date()
            }
          });
        }
      }

      // 3. Check if PO is completely delivered to update its status
      const allTracking = await tx.productionTracking.findMany({ where: { po_id } });
      const allCompleted = allTracking.every(t => t.pending_qty <= 0);
      
      if (allCompleted) {
        await tx.purchaseOrder.update({
          where: { id: po_id },
          data: { status: 'Completed' }
        });
      }
    });

  } catch (error: any) {
    console.error('Failed to create GDN:', error);
    return { error: error.message || 'Failed to create GDN' };
  }

  revalidatePath('/delivery');
  revalidatePath('/production');
  revalidatePath('/purchase-orders');
  redirect('/delivery');
}
