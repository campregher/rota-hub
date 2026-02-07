import { Injectable } from "@nestjs/common";
import { JobStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  feed(limit = 20) {
    return this.prisma.deliveryJob.findMany({
      where: {
        status: JobStatus.OPEN
      },
      include: {
        pickupAddress: true,
        dropoffAddress: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(limit, 100)
    });
  }
}
