import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TrackingModule } from "../tracking/tracking.module";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

@Module({
  imports: [TrackingModule, AuthModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
