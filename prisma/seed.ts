import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Customers
  const customer1 = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      customer_name: 'ABC Corp',
      address: '123 Industrial Area, Karachi',
      ntn: '1234567-8',
      sales_tax_registration: 'STRN-987654',
      vendor_code: 'V-001',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      customer_name: 'XYZ Industries',
      address: '456 Business Hub, Lahore',
      ntn: '8765432-1',
      sales_tax_registration: 'STRN-123456',
      vendor_code: 'V-002',
    },
  });

  // Seed Products
  const p1 = await prisma.product.upsert({
    where: { product_code: 'P-001' },
    update: {},
    create: {
      product_name: 'Industrial Valve A',
      product_code: 'P-001',
      unit_price: 1500.0,
    },
  });

  const p2 = await prisma.product.upsert({
    where: { product_code: 'P-002' },
    update: {},
    create: {
      product_name: 'Steel Pipe 2inch',
      product_code: 'P-002',
      unit_price: 800.0,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
