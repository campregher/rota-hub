import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptJobDto {
  @ApiProperty({ description: 'TODO: derive from JWT in production.' })
  @IsString()
  courierId: string;
}
