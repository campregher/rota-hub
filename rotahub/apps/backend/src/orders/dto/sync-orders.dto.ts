import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Marketplace } from '@prisma/client';

export class SyncOrdersDto {
  @ApiProperty()
  @IsString()
  sellerId: string;

  @ApiProperty({ enum: Marketplace })
  @IsEnum(Marketplace)
  marketplace: Marketplace;

  @ApiProperty()
  @IsString()
  marketplaceOrderId: string;
}
