import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { CourierController } from './courier.controller';

@Module({
  providers: [JobsService],
  controllers: [JobsController, CourierController],
  exports: [JobsService]
})
export class JobsModule {}
