import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ enum: [UserRole.SELLER, UserRole.COURIER] })
  @IsEnum(UserRole)
  role!: UserRole;
}
