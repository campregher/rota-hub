import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role !== UserRole.SELLER && dto.role !== UserRole.COURIER) {
      throw new BadRequestException("Only SELLER and COURIER are allowed in MVP");
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUserWithProfile({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto) {
    const refreshSecret = this.configService.get<string>(
      "JWT_REFRESH_SECRET",
      "change_me_refresh"
    );

    let payload: { sub: string; email: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: refreshSecret
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessSecret = this.configService.get<string>(
      "JWT_ACCESS_SECRET",
      "change_me_access"
    );
    const refreshSecret = this.configService.get<string>(
      "JWT_REFRESH_SECRET",
      "change_me_refresh"
    );
    const accessExpiresIn = this.configService.get<string>(
      "JWT_ACCESS_EXPIRES_IN",
      "15m"
    );
    const refreshExpiresIn = this.configService.get<string>(
      "JWT_REFRESH_EXPIRES_IN",
      "7d"
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: accessExpiresIn }
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: refreshSecret, expiresIn: refreshExpiresIn }
      )
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer"
    };
  }
}
