import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreatePodDto } from "./dto/create-pod.dto";
import { PodService } from "./pod.service";

@ApiTags("POD")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COURIER", "ADMIN")
@Controller("jobs/:id/pod")
export class PodController {
  constructor(private readonly podService: PodService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("photo", {
      limits: {
        fileSize: 5 * 1024 * 1024
      }
    })
  )
  create(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreatePodDto,
    @UploadedFile() photo?: { buffer: Buffer; originalname: string; mimetype: string }
  ) {
    return this.podService.create(id, dto, photo);
  }
}
