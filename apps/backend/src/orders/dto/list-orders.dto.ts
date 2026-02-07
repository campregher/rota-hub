import { ApiPropertyOptional } from "@nestjs/swagger";
import { Marketplace } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class ListOrdersDto {
  @ApiPropertyOptional({ enum: Marketplace })
  @IsOptional()
  @IsEnum(Marketplace)
  marketplace?: Marketplace;
}
