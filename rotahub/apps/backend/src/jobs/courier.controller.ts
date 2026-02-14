import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobStatus } from '@prisma/client';

@ApiTags('courier')
@Controller('courier')
export class CourierController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('feed')
  feed() {
    return this.jobsService.listJobs(JobStatus.OPEN);
  }
}
