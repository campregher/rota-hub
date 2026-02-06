import { PrismaClient, Role, Marketplace, OrderStatus, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const courierPassword = await bcrypt.hash('courier123', 10);

  const seller = await prisma.user.create({
    data: {
      email: 'seller@rotahub.com',
      passwordHash: sellerPassword,
      role: Role.SELLER,
      seller: { create: { companyName: 'Seller Store' } }
    }
  });

  const courier1 = await prisma.user.create({
    data: {
      email: 'courier1@rotahub.com',
      passwordHash: courierPassword,
      role: Role.COURIER,
      courier: { create: { fullName: 'Courier One' } }
    }
  });

  const courier2 = await prisma.user.create({
    data: {
      email: 'courier2@rotahub.com',
      passwordHash: courierPassword,
      role: Role.COURIER,
      courier: { create: { fullName: 'Courier Two' } }
    }
  });

  const pickup = await prisma.address.create({
    data: {
      label: 'Pickup 1',
      line1: 'Rua A, 123',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01000-000',
      country: 'BR'
    }
  });

  const dropoff = await prisma.address.create({
    data: {
      label: 'Dropoff 1',
      line1: 'Rua B, 456',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01310-000',
      country: 'BR'
    }
  });

  const order1 = await prisma.order.create({
    data: {
      sellerId: seller.id,
      marketplace: Marketplace.MERCADOLIVRE,
      marketplaceOrderId: 'ML-1001',
      status: OrderStatus.SYNCED,
      pickupAddressId: pickup.id,
      dropoffAddressId: dropoff.id
    }
  });

  const order2 = await prisma.order.create({
    data: {
      sellerId: seller.id,
      marketplace: Marketplace.SHOPEE,
      marketplaceOrderId: 'SP-2001',
      status: OrderStatus.SYNCED,
      pickupAddressId: pickup.id,
      dropoffAddressId: dropoff.id
    }
  });

  await prisma.deliveryJob.create({
    data: {
      orderId: order1.id,
      sellerId: seller.id,
      status: JobStatus.OPEN
    }
  });

  await prisma.deliveryJob.create({
    data: {
      orderId: order2.id,
      sellerId: seller.id,
      status: JobStatus.OPEN
    }
  });

  console.log({ seller: seller.email, couriers: [courier1.email, courier2.email] });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
