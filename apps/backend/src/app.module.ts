import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { CourierModule } from "./courier/courier.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { JobsModule } from "./jobs/jobs.module";
import { MatchingModule } from "./matching/matching.module";
import { OrdersModule } from "./orders/orders.module";
import { PodModule } from "./pod/pod.module";
import { PayoutsModule } from "./payouts/payouts.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TrackingModule } from "./tracking/tracking.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), "../../.env"), join(process.cwd(), ".env")]
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    IntegrationsModule,
    OrdersModule,
    JobsModule,
    MatchingModule,
    TrackingModule,
    PodModule,
    PayoutsModule,
    CourierModule
  ]
})
export class AppModule {}
