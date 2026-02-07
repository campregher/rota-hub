import { Injectable } from "@nestjs/common";
import { Marketplace, OrderStatusNormalized } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ListOrdersDto } from "./dto/list-orders.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async syncStubOrders(sellerUserId: string) {
    const mlOrderId = `MLB-STUB-${sellerUserId}`;
    const shopeeOrderId = `SHP-STUB-${sellerUserId}`;

    const mlOrder = await this.prisma.order.upsert({
      where: {
        marketplace_marketplaceOrderId: {
          marketplace: Marketplace.MERCADO_LIVRE,
          marketplaceOrderId: mlOrderId
        }
      },
      update: {
        status: OrderStatusNormalized.READY_TO_SHIP
      },
      create: {
        sellerId: sellerUserId,
        marketplace: Marketplace.MERCADO_LIVRE,
        marketplaceOrderId: mlOrderId,
        status: OrderStatusNormalized.READY_TO_SHIP,
        totalCents: 12990,
        rawPayload: {
          source: "stub",
          marketplace: "mercadolivre"
        }
      }
    });

    const shopeeOrder = await this.prisma.order.upsert({
      where: {
        marketplace_marketplaceOrderId: {
          marketplace: Marketplace.SHOPEE,
          marketplaceOrderId: shopeeOrderId
        }
      },
      update: {
        status: OrderStatusNormalized.READY_TO_SHIP
      },
      create: {
        sellerId: sellerUserId,
        marketplace: Marketplace.SHOPEE,
        marketplaceOrderId: shopeeOrderId,
        status: OrderStatusNormalized.READY_TO_SHIP,
        totalCents: 8990,
        rawPayload: {
          source: "stub",
          marketplace: "shopee"
        }
      }
    });

    return { synced: [mlOrder, shopeeOrder] };
  }

  listOrders(sellerUserId: string, query: ListOrdersDto) {
    return this.prisma.order.findMany({
      where: {
        sellerId: sellerUserId,
        marketplace: query.marketplace
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
