import { Injectable } from "@nestjs/common";
import { UserRole, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUserWithProfile(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
          fullName: input.fullName,
          role: input.role,
          status: UserStatus.ACTIVE
        }
      });

      if (input.role === UserRole.SELLER) {
        await tx.sellerProfile.create({ data: { userId: user.id } });
      }

      if (input.role === UserRole.COURIER) {
        await tx.courierProfile.create({ data: { userId: user.id } });
      }

      return user;
    });
  }
}
