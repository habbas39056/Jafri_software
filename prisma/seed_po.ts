import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst();

  if (!customer || !product) {
    console.log('No customer or product found. Please seed first.');
    return;
  }

  const po = await prisma.purchaseOrder.create({
    data: {
      po_number: 'PO-2026-001',
      customer_id: customer.id,
      po_date: new Date(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'Pending',
      items: {
        create: [
          {
            product_id: product.id,
            quantity: 100,
            rate: product.unit_price,
            total_amount: 100 * product.unit_price,
          }
        ]
      },
      production: {
        create: [
          {
            product_id: product.id,
            ordered_qty: 100,
            pending_qty: 100,
            status: 'Pending',
          }
        ]
      }
    }
  });

  console.log('PO created successfully:', po.po_number);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
