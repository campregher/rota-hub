import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { CreateJobDto } from "./dto/create-job.dto";
import { ListJobsDto } from "./dto/list-jobs.dto";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto";
import { JobsService } from "./jobs.service";

@ApiTags("Jobs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles("SELLER", "ADMIN")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.sub, dto);
  }

  @Get()
  @Roles("SELLER", "COURIER", "ADMIN")
  list(@Query() query: ListJobsDto) {
    return this.jobsService.list(query);
  }

  @Post(":id/accept")
  @Roles("COURIER", "ADMIN")
  accept(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser
  ) {
    return this.jobsService.accept(id, user.sub);
  }

  @Post(":id/status")
  @Roles("COURIER", "ADMIN")
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobStatusDto,
    @CurrentUser() user: JwtUser
  ) {
    return this.jobsService.updateStatus(id, dto, user.sub);
  }
}
