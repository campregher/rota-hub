import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PayoutsService } from "./payouts.service";

@ApiTags("Payouts")
@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  list(@Query("courierUserId") courierUserId?: string) {
    return this.payoutsService.list(courierUserId);
  }
}
