import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min
} from "class-validator";
import { ID_LIKE_MESSAGE, ID_LIKE_REGEX } from "../../common/validators/id-like.regex";

export class CreateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(ID_LIKE_REGEX, { message: `orderId ${ID_LIKE_MESSAGE}` })
  orderId?: string;

  @ApiProperty()
  @Matches(ID_LIKE_REGEX, { message: `pickupAddressId ${ID_LIKE_MESSAGE}` })
  pickupAddressId!: string;

  @ApiProperty()
  @Matches(ID_LIKE_REGEX, { message: `dropoffAddressId ${ID_LIKE_MESSAGE}` })
  dropoffAddressId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
