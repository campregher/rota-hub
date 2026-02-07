import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreatePodDto } from "./dto/create-pod.dto";
import { PodService } from "./pod.service";

@ApiTags("POD")
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
