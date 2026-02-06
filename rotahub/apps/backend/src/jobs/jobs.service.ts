import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, TrackingEventType } from '@prisma/client';
import { Prisma } from '@prisma/client';

const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
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
  constructor(private readonly prisma: PrismaService) {}

  createJob(orderId: string, sellerId: string, expiresAt?: string) {
    return this.prisma.deliveryJob.create({
      data: {
        orderId,
        sellerId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        tracking: {
          create: {
            type: TrackingEventType.STATUS_CHANGE,
            status: JobStatus.OPEN
          }
        }
      }
    });
  }

  listJobs(status?: JobStatus) {
    return this.prisma.deliveryJob.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { assignment: true }
    });
  }

  async acceptJob(jobId: string, courierId: string) {
    const job = await this.prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Job is not open');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const assignment = await tx.jobAssignment.create({
          data: {
            jobId,
            courierId
          }
        });
        const updated = await tx.deliveryJob.update({
          where: { id: jobId },
          data: { status: JobStatus.ASSIGNED }
        });
        await tx.trackingEvent.create({
          data: {
            jobId,
            type: TrackingEventType.STATUS_CHANGE,
            status: JobStatus.ASSIGNED
          }
        });
        return { assignment, job: updated };
      });
    } catch (error) {
      const errorCode =
        error instanceof Prisma.PrismaClientKnownRequestError ? error.code : (error as { code?: string })?.code;
      if (errorCode === 'P2002') {
        throw new ConflictException('Job already assigned');
      }
      throw error;
    }
  }

  async updateStatus(jobId: string, nextStatus: JobStatus, note?: string, podRequired = false) {
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id: jobId },
      include: { pod: true }
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const allowed = STATUS_TRANSITIONS[job.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(`Invalid status transition from ${job.status} to ${nextStatus}`);
    }

    if (nextStatus === JobStatus.DELIVERED && podRequired && !job.pod) {
      throw new BadRequestException('Proof of delivery required');
    }

    const updated = await this.prisma.deliveryJob.update({
      where: { id: jobId },
      data: { status: nextStatus }
    });
    await this.prisma.trackingEvent.create({
      data: {
        jobId,
        type: TrackingEventType.STATUS_CHANGE,
        status: nextStatus,
        metadata: note ? { note } : undefined
      }
    });
    return updated;
  }
}
