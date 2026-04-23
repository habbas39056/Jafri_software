import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst();
  const po = await prisma.purchaseOrder.findFirst();

  if (!customer || !product || !po) {
    console.log('Missing prerequisite data.');
    return;
  }

  // 1. Create a Challan
  const challan = await prisma.challan.create({
    data: {
      gdn_number: 'GDN-2026-001',
      po_id: po.id,
      challan_date: new Date(),
      customer_id: customer.id,
      status: 'Delivered',
      items: {
        create: [
          {
            product_id: product.id,
            delivered_qty: 40,
            remarks: 'First batch delivered'
          }
        ]
      }
    }
  });

  // 2. Update Production Tracking
  await prisma.productionTracking.updateMany({
    where: { po_id: po.id, product_id: product.id },
    data: {
      delivered_qty: 40,
      pending_qty: 60, // 100 - 40
      status: 'In Progress'
    }
  });

  // 3. Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoice_number: 'INV-2026-001',
      customer_id: customer.id,
      po_id: po.id,
      invoice_date: new Date(),
      subtotal: 40 * product.unit_price,
      gst_amount: (40 * product.unit_price) * 0.18,
      total_amount: (40 * product.unit_price) * 1.18,
      status: 'Pending',
      items: {
        create: [
          {
            product_id: product.id,
            quantity: 40,
            rate: product.unit_price,
            amount: 40 * product.unit_price
          }
        ]
      },
      deliveries: {
        create: {
          po_id: po.id,
          product_id: product.id,
          delivered_qty: 40,
          delivery_date: new Date()
        }
      },
      sales_tax_info: {
        create: {
          gst_percentage: 18,
          gst_amount: (40 * product.unit_price) * 0.18,
          total_with_tax: (40 * product.unit_price) * 1.18
        }
      },
      warranties: {
        create: {
          warranty_number: 'W-2026-001',
          customer_id: customer.id,
          start_date: new Date(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          status: 'Active'
        }
      }
    }
  });

  // 4. Record a Partial Payment
  await prisma.payment.create({
    data: {
      customer_id: customer.id,
      invoice_id: invoice.id,
      payment_date: new Date(),
      amount_paid: 50000,
      payment_method: 'Cheque',
      remarks: 'Initial payment for invoice'
    }
  });

  console.log('Full workflow seed completed.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
