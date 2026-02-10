import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { PayoutsService } from "./payouts.service";

@ApiTags("Payouts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COURIER", "ADMIN")
@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query("courierUserId") courierUserId?: string) {
    const targetCourierId = user.role === "ADMIN" ? courierUserId : user.sub;
    return this.payoutsService.list(targetCourierId);
  }
}
