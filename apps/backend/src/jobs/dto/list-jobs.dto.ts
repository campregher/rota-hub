import { ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class ListJobsDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
