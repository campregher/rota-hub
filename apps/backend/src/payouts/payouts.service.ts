import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  list(courierUserId?: string) {
    return this.prisma.payout.findMany({
      where: {
        courierId: courierUserId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
