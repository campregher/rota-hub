import { Module } from "@nestjs/common";
import { TrackingModule } from "../tracking/tracking.module";
import { PodController } from "./pod.controller";
import { PodService } from "./pod.service";

@Module({
  imports: [TrackingModule],
  controllers: [PodController],
  providers: [PodService],
  exports: [PodService]
})
export class PodModule {}
