import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JobStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.createJob(dto.orderId, dto.sellerId, dto.expiresAt);
  }

  @Get()
  list(@Query('status') status?: JobStatus) {
    return this.jobsService.listJobs(status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  accept(@Param('id') id: string, @Body() dto: AcceptJobDto, @Req() req: { user?: { sub?: string } }) {
    const courierId = req.user?.sub || dto.courierId;
    // TODO: enforce JWT-only courier identification.
    return this.jobsService.acceptJob(id, courierId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const podRequired = process.env.POD_REQUIRED === 'true';
    return this.jobsService.updateStatus(id, dto.status, dto.note, podRequired);
  }
}
