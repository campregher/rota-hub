import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, TrackingEventType } from '@prisma/client';

@Injectable()
export class PodService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET || 'rotahub';
    this.s3 = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minio',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minio12345'
      },
      forcePathStyle: true
    });
  }

  async createPod(
    jobId: string,
    payload: {
      receiverName?: string;
      deliveredAt?: string;
      lat?: number;
      lng?: number;
    },
    file?: Express.Multer.File
  ) {
    let photoUrl: string | undefined;
    if (file) {
      const key = `pod/${jobId}/${Date.now()}-${file.originalname}`;
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      );
      photoUrl = `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${this.bucket}/${key}`;
    }

    const pod = await this.prisma.proofOfDelivery.create({
      data: {
        jobId,
        receiverName: payload.receiverName || 'Unknown',
        deliveredAt: payload.deliveredAt ? new Date(payload.deliveredAt) : new Date(),
        photoUrl,
        lat: payload.lat,
        lng: payload.lng
      }
    });

    const job = await this.prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (job && job.status !== JobStatus.DELIVERED) {
      await this.prisma.deliveryJob.update({
        where: { id: jobId },
        data: { status: JobStatus.DELIVERED }
      });
      await this.prisma.trackingEvent.create({
        data: {
          jobId,
          type: TrackingEventType.STATUS_CHANGE,
          status: JobStatus.DELIVERED,
          metadata: {
            podCreated: true
          }
        }
      });
    }

    return pod;
  }
}
