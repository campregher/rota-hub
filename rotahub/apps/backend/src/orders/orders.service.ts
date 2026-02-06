import { Injectable } from '@nestjs/common';
import { Marketplace, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async syncOrder(sellerId: string, marketplace: Marketplace, marketplaceOrderId: string) {
    const pickup = await this.prisma.address.create({
      data: {
        label: 'Pickup',
        line1: 'Rua do Centro, 100',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01000-000',
        country: 'BR'
      }
    });
    const dropoff = await this.prisma.address.create({
      data: {
        label: 'Dropoff',
        line1: 'Av. Paulista, 500',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-100',
        country: 'BR'
      }
    });

    return this.prisma.order.upsert({
      where: { marketplace_marketplaceOrderId: { marketplace, marketplaceOrderId } },
      create: {
        sellerId,
        marketplace,
        marketplaceOrderId,
        status: OrderStatus.SYNCED,
        pickupAddressId: pickup.id,
        dropoffAddressId: dropoff.id
      },
      update: {
        status: OrderStatus.SYNCED
      }
    });
  }

  listOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { job: true }
    });
  }
}
