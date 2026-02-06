import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  @Post('mercadolivre/connect')
  connectMercadoLivre() {
    return {
      url: 'https://example.com/oauth/mercadolivre?client_id=TODO'
    };
  }

  @Get('mercadolivre/callback')
  callbackMercadoLivre(@Query('code') code?: string) {
    return {
      message: 'TODO: exchange code for tokens (store encrypted).',
      code
    };
  }

  @Post('shopee/connect')
  connectShopee() {
    return {
      url: 'https://example.com/oauth/shopee?client_id=TODO'
    };
  }
}
