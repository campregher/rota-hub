import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JobStatus, Prisma, TrackingEventType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingService } from "../tracking/tracking.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { ListJobsDto } from "./dto/list-jobs.dto";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto";

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  OPEN: [JobStatus.ASSIGNED, JobStatus.CANCELLED],
  ASSIGNED: [JobStatus.PICKED_UP, JobStatus.CANCELLED, JobStatus.DISPUTE],
  PICKED_UP: [JobStatus.IN_TRANSIT, JobStatus.DISPUTE],
  IN_TRANSIT: [JobStatus.DELIVERED, JobStatus.DISPUTE],
  DELIVERED: [],
  CANCELLED: [],
  DISPUTE: []
};

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
    private readonly configService: ConfigService
  ) {}

  async create(sellerUserId: string, dto: CreateJobDto) {
    const job = await this.prisma.deliveryJob.create({
      data: {
        sellerId: sellerUserId,
        orderId: dto.orderId,
        pickupAddressId: dto.pickupAddressId,
        dropoffAddressId: dto.dropoffAddressId,
        status: JobStatus.OPEN,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        priceCents: dto.priceCents,
        notes: dto.notes
      }
    });

    await this.trackingService.createEvent({
      jobId: job.id,
      eventType: TrackingEventType.JOB_CREATED,
      toStatus: JobStatus.OPEN,
      payload: { source: "jobs.create" }
    });

    return job;
  }

  list(query: ListJobsDto) {
    return this.prisma.deliveryJob.findMany({
      where: {
        status: query.status
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        assignment: true,
        proofOfDelivery: true
      }
    });
  }

  async accept(jobId: string, courierUserId: string) {
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException("Job must be OPEN to accept");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.jobAssignment.create({
          data: {
            jobId,
            courierId: courierUserId
          }
        });

        const updatedJob = await tx.deliveryJob.update({
          where: { id: jobId },
          data: {
            status: JobStatus.ASSIGNED,
            assignedCourierId: courierUserId,
            assignedAt: new Date()
          },
          include: {
            assignment: true
          }
        });

        await this.trackingService.createEvent(
          {
            jobId,
            eventType: TrackingEventType.JOB_ACCEPTED,
            fromStatus: JobStatus.OPEN,
            toStatus: JobStatus.ASSIGNED,
            actorUserId: courierUserId,
            payload: { acceptedBy: courierUserId }
          },
          tx
        );

        return updatedJob;
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new ConflictException("Job already accepted by another courier");
      }
      throw error;
    }
  }

  async updateStatus(jobId: string, dto: UpdateJobStatusDto, actorUserId?: string) {
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id: jobId },
      include: {
        proofOfDelivery: true
      }
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (!this.isTransitionAllowed(job.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${job.status} to ${dto.status}`
      );
    }

    const podRequired = this.isTruthy(
      this.configService.get<string>("POD_REQUIRED", "true")
    );
    if (dto.status === JobStatus.DELIVERED && podRequired && !job.proofOfDelivery) {
      throw new BadRequestException(
        "Proof of delivery is required before marking as DELIVERED"
      );
    }

    const patch: Prisma.DeliveryJobUpdateInput = {
      status: dto.status
    };

    if (dto.status === JobStatus.PICKED_UP) {
      patch.pickedUpAt = new Date();
    }
    if (dto.status === JobStatus.DELIVERED) {
      patch.deliveredAt = new Date();
    }
    if (dto.status === JobStatus.CANCELLED) {
      patch.cancelledAt = new Date();
    }

    const updated = await this.prisma.deliveryJob.update({
      where: { id: jobId },
      data: patch
    });

    await this.trackingService.createEvent({
      jobId,
      eventType:
        dto.status === JobStatus.CANCELLED
          ? TrackingEventType.JOB_CANCELLED
          : dto.status === JobStatus.DISPUTE
            ? TrackingEventType.JOB_DISPUTE
            : TrackingEventType.STATUS_CHANGED,
      fromStatus: job.status,
      toStatus: dto.status,
      actorUserId,
      payload: { source: "jobs.updateStatus" }
    });

    return updated;
  }

  private isTransitionAllowed(from: JobStatus, to: JobStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  private isTruthy(value: string | undefined): boolean {
    if (!value) return false;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }
}
