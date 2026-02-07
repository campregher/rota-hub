import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CourierService } from "./courier.service";

@ApiTags("Courier")
@Controller("courier")
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get("feed")
  feed(@Query("limit") limit?: number) {
    return this.courierService.feed(limit ? Number(limit) : 20);
  }
}
