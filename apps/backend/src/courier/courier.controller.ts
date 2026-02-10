import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CourierService } from "./courier.service";

@ApiTags("Courier")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COURIER", "ADMIN")
@Controller("courier")
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get("feed")
  feed(@Query("limit") limit?: number) {
    return this.courierService.feed(limit ? Number(limit) : 20);
  }
}
