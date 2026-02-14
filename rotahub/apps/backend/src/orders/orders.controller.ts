import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { SyncOrdersDto } from './dto/sync-orders.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('sync')
  sync(@Body() dto: SyncOrdersDto) {
    return this.ordersService.syncOrder(dto.sellerId, dto.marketplace, dto.marketplaceOrderId);
  }

  @Get()
  list() {
    return this.ordersService.listOrders();
  }
}
