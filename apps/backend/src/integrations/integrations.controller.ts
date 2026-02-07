import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { IntegrationsService } from "./integrations.service";

@ApiTags("Integrations")
@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post("mercadolivre/connect")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  connectMercadoLivre(@CurrentUser() user: JwtUser) {
    return this.integrationsService.connectMercadoLivre(user.sub);
  }

  @Get("mercadolivre/callback")
  mercadolivreCallback(
    @Query("code") code?: string,
    @Query("state") state?: string
  ) {
    return this.integrationsService.mercadolivreCallback(code, state);
  }

  @Post("shopee/connect")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  connectShopee(@CurrentUser() user: JwtUser) {
    return this.integrationsService.connectShopee(user.sub);
  }
}
