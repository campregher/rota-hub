import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, TrackingEventType } from "@prisma/client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingService } from "../tracking/tracking.service";
import { CreatePodDto } from "./dto/create-pod.dto";

@Injectable()
export class PodService {
  private supabase?: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly trackingService: TrackingService
  ) {}

  async create(
    jobId: string,
    dto: CreatePodDto,
    file?: { buffer: Buffer; originalname: string; mimetype: string }
  ) {
    const job = await this.prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    let photoUrl: string | null = null;

    if (file) {
      const supabase = this.getSupabaseClient();
      const bucket = this.configService.get<string>("SUPABASE_POD_BUCKET", "rotahub-pod");
      const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const filePath = `${jobId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new InternalServerErrorException("Failed to upload POD photo");
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      photoUrl = data.publicUrl;
    }

    if (!dto.receiverName?.trim()) {
      throw new BadRequestException("receiverName is required");
    }

    const payload: Prisma.ProofOfDeliveryUncheckedCreateInput = {
      jobId,
      receiverName: dto.receiverName,
      lat: dto.lat,
      lng: dto.lng,
      deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : new Date(),
      photoUrl
    };

    const pod = await this.prisma.proofOfDelivery.upsert({
      where: { jobId },
      update: payload,
      create: payload
    });

    await this.trackingService.createEvent({
      jobId,
      eventType: TrackingEventType.POD_UPLOADED,
      toStatus: job.status,
      payload: {
        hasPhoto: Boolean(photoUrl)
      }
    });

    return pod;
  }

  private getSupabaseClient(): SupabaseClient {
    if (this.supabase) return this.supabase;

    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new BadRequestException(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for POD photo upload"
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
    return this.supabase;
  }
}
