import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePodDto } from './dto/create-pod.dto';
import { PodService } from './pod.service';

@ApiTags('pod')
@Controller('jobs')
export class PodController {
  constructor(private readonly podService: PodService) {}

  @Post(':id/pod')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  createPod(
    @Param('id') id: string,
    @Body() dto: CreatePodDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.podService.createPod(id, dto, file);
  }
}
