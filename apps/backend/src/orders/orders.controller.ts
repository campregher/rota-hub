import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { ListOrdersDto } from "./dto/list-orders.dto";
import { OrdersService } from "./orders.service";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SELLER", "ADMIN")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("sync")
  sync(@CurrentUser() user: JwtUser) {
    return this.ordersService.syncStubOrders(user.sub);
  }

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: ListOrdersDto) {
    return this.ordersService.listOrders(user.sub, query);
  }
}
