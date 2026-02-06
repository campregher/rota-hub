import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, passwordHash: string, role: Role) {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        seller: role === Role.SELLER ? { create: { companyName: 'Seller' } } : undefined,
        courier: role === Role.COURIER ? { create: { fullName: 'Courier' } } : undefined
      }
    });
  }
}
