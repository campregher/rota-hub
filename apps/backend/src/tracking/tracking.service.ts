import { Injectable } from "@nestjs/common";
import { JobStatus, Prisma, TrackingEventType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  createEvent(
    input: {
      jobId: string;
      eventType: TrackingEventType;
      fromStatus?: JobStatus;
      toStatus?: JobStatus;
      actorUserId?: string;
      payload?: Prisma.InputJsonValue;
    },
    tx?: Prisma.TransactionClient
  ) {
    const db = tx ?? this.prisma;
    return db.trackingEvent.create({
      data: {
        jobId: input.jobId,
        eventType: input.eventType,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        actorUserId: input.actorUserId,
        payload: input.payload
      }
    });
  }
}
