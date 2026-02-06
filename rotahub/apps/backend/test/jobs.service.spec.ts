import { ConflictException, BadRequestException } from '@nestjs/common';
import { JobsService } from '../src/jobs/jobs.service';
import { JobStatus, TrackingEventType } from '@prisma/client';

const prismaMock = {
  deliveryJob: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn()
  },
  jobAssignment: {
    create: jest.fn()
  },
  trackingEvent: {
    create: jest.fn()
  },
  $transaction: jest.fn()
};

describe('JobsService.acceptJob', () => {
  let service: JobsService;

  beforeEach(() => {
    service = new JobsService(prismaMock as any);
    jest.clearAllMocks();
  });

  it('accepts job successfully', async () => {
    prismaMock.deliveryJob.findUnique.mockResolvedValue({ id: 'job-1', status: JobStatus.OPEN });
    prismaMock.$transaction.mockImplementation(async (cb: any) =>
      cb({
        jobAssignment: { create: jest.fn().mockResolvedValue({ id: 'assign-1' }) },
        deliveryJob: { update: jest.fn().mockResolvedValue({ id: 'job-1', status: JobStatus.ASSIGNED }) },
        trackingEvent: { create: jest.fn().mockResolvedValue({ id: 'track-1' }) }
      })
    );

    const result = await service.acceptJob('job-1', 'courier-1');

    expect(result.job.status).toBe(JobStatus.ASSIGNED);
  });

  it('throws conflict when assignment exists', async () => {
    prismaMock.deliveryJob.findUnique.mockResolvedValue({ id: 'job-1', status: JobStatus.OPEN });
    prismaMock.$transaction.mockRejectedValue({ code: 'P2002' });

    await expect(service.acceptJob('job-1', 'courier-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when job is not open', async () => {
    prismaMock.deliveryJob.findUnique.mockResolvedValue({ id: 'job-1', status: JobStatus.ASSIGNED });

    await expect(service.acceptJob('job-1', 'courier-1')).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('JobsService.updateStatus', () => {
  let service: JobsService;

  beforeEach(() => {
    service = new JobsService(prismaMock as any);
    jest.clearAllMocks();
  });

  it('rejects invalid transitions', async () => {
    prismaMock.deliveryJob.findUnique.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.OPEN,
      pod: null
    });

    await expect(service.updateStatus('job-1', JobStatus.DELIVERED)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});
