import {
  BadRequestException,
  ConflictException,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JobStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingService } from "../tracking/tracking.service";
import { JobsService } from "./jobs.service";

describe("JobsService", () => {
  const mockPrisma = {
    deliveryJob: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn()
  } as unknown as PrismaService;

  const mockTracking = {
    createEvent: jest.fn()
  } as unknown as TrackingService;

  const mockConfig = {
    get: jest.fn((key: string, defaultValue: string) => {
      if (key === "POD_REQUIRED") return "true";
      return defaultValue;
    })
  } as unknown as ConfigService;

  let service: JobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobsService(mockPrisma, mockTracking, mockConfig);
  });

  it("accept should succeed when job is OPEN and unassigned", async () => {
    (mockPrisma.deliveryJob.findUnique as jest.Mock).mockResolvedValue({
      id: "job-1",
      status: JobStatus.OPEN
    });

    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      const tx = {
        jobAssignment: { create: jest.fn().mockResolvedValue({}) },
        deliveryJob: {
          update: jest.fn().mockResolvedValue({ id: "job-1", status: JobStatus.ASSIGNED })
        }
      };
      return cb(tx);
    });

    const result = await service.accept("job-1", "courier-1");
    expect(result.status).toBe(JobStatus.ASSIGNED);
  });

  it("accept should throw 409 conflict when unique assignment fails", async () => {
    (mockPrisma.deliveryJob.findUnique as jest.Mock).mockResolvedValue({
      id: "job-1",
      status: JobStatus.OPEN
    });

    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      const tx = {
        jobAssignment: {
          create: jest.fn().mockRejectedValue({ code: "P2002" })
        },
        deliveryJob: { update: jest.fn() }
      };
      return cb(tx);
    });

    await expect(service.accept("job-1", "courier-1")).rejects.toBeInstanceOf(
      ConflictException
    );
  });

  it("accept should fail when job is not OPEN", async () => {
    (mockPrisma.deliveryJob.findUnique as jest.Mock).mockResolvedValue({
      id: "job-1",
      status: JobStatus.ASSIGNED
    });

    await expect(service.accept("job-1", "courier-1")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("accept should fail when job does not exist", async () => {
    (mockPrisma.deliveryJob.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.accept("job-404", "courier-1")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("updateStatus should reject invalid transition", async () => {
    (mockPrisma.deliveryJob.findUnique as jest.Mock).mockResolvedValue({
      id: "job-1",
      status: JobStatus.OPEN,
      proofOfDelivery: null
    });

    await expect(
      service.updateStatus("job-1", {
        status: JobStatus.DELIVERED
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
