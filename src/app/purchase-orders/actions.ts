'use server';

import { prisma } from '@/lib/prisma';
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

  try {
    // We use a transaction to ensure all related records are created together
    await prisma.$transaction(async (tx) => {
      // 1. Create the Purchase Order
      const po = await tx.purchaseOrder.create({
        data: {
          po_number,
          customer_id,
          po_date: new Date(po_date),
          due_date: new Date(due_date),
          status: 'Pending',
          gst_percentage,
          items: {
            create: items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              rate: item.rate,
              total_amount: item.total_amount
            }))
          }
        }
      });

      // 2. Create Production Tracking entries for each item
      // Automation Rule: Pending Qty = Ordered - Delivered - Rejected (Initially Ordered = Pending)
      const productionData = items.map(item => ({
        po_id: po.id,
        product_id: item.product_id,
        ordered_qty: item.quantity,
        delivered_qty: 0,
        rejected_qty: 0,
        pending_qty: item.quantity,
        status: 'Pending'
      }));

      await tx.productionTracking.createMany({
        data: productionData
      });
    });
  } catch (error) {
    console.error('Failed to create PO:', error);
    return { error: 'Failed to create Purchase Order. PO number might already exist.' };
  }

  revalidatePath('/purchase-orders');
  revalidatePath('/production');
  redirect('/purchase-orders');
}

export async function deletePurchaseOrder(id: number) {
  try {
    // Delete items and production tracking first due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      await tx.pOItem.deleteMany({ where: { po_id: id } });
      await tx.productionTracking.deleteMany({ where: { po_id: id } });
      await tx.purchaseOrder.delete({ where: { id } });
    });
    
    revalidatePath('/purchase-orders');
    revalidatePath('/production');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete Purchase Order' };
  }
}
