import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConnectionStatus, Marketplace } from "@prisma/client";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async connectMercadoLivre(sellerUserId: string) {
    await this.prisma.marketplaceConnection.upsert({
      where: {
        sellerId_marketplace: {
          sellerId: sellerUserId,
          marketplace: Marketplace.MERCADO_LIVRE
        }
      },
      update: { status: ConnectionStatus.PENDING },
      create: {
        sellerId: sellerUserId,
        marketplace: Marketplace.MERCADO_LIVRE,
        status: ConnectionStatus.PENDING
      }
    });

    const clientId = this.configService.get<string>("ML_CLIENT_ID", "ml_client_id_placeholder");
    const redirectUri = this.configService.get<string>(
      "ML_REDIRECT_URI",
      "http://localhost:3000/integrations/mercadolivre/callback"
    );
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state: sellerUserId
    });

    return {
      url: `https://auth.mercadolivre.com.br/authorization?${params.toString()}`,
      message: "Placeholder OAuth URL for Mercado Livre"
    };
  }

  async mercadolivreCallback(code?: string, state?: string) {
    if (state) {
      const accessToken = `ml_access_${code ?? "stub"}`;
      const refreshToken = `ml_refresh_${code ?? "stub"}`;

      await this.prisma.marketplaceConnection.upsert({
        where: {
          sellerId_marketplace: {
            sellerId: state,
            marketplace: Marketplace.MERCADO_LIVRE
          }
        },
        update: {
          status: ConnectionStatus.CONNECTED,
          accessTokenEncrypted: this.encryptToken(accessToken),
          refreshTokenEncrypted: this.encryptToken(refreshToken),
          tokenExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        },
        create: {
          sellerId: state,
          marketplace: Marketplace.MERCADO_LIVRE,
          status: ConnectionStatus.CONNECTED,
          accessTokenEncrypted: this.encryptToken(accessToken),
          refreshTokenEncrypted: this.encryptToken(refreshToken),
          tokenExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        }
      });
    }

    return {
      message: "Mercado Livre callback placeholder",
      code: code ?? null,
      state: state ?? null
    };
  }

  async connectShopee(sellerUserId: string) {
    await this.prisma.marketplaceConnection.upsert({
      where: {
        sellerId_marketplace: {
          sellerId: sellerUserId,
          marketplace: Marketplace.SHOPEE
        }
      },
      update: { status: ConnectionStatus.PENDING },
      create: {
        sellerId: sellerUserId,
        marketplace: Marketplace.SHOPEE,
        status: ConnectionStatus.PENDING
      }
    });

    const partnerId = this.configService.get<string>(
      "SHOPEE_CLIENT_ID",
      "shopee_client_id_placeholder"
    );
    const redirectUri = this.configService.get<string>(
      "SHOPEE_REDIRECT_URI",
      "http://localhost:3000/integrations/shopee/callback"
    );
    const params = new URLSearchParams({
      partner_id: partnerId,
      redirect: redirectUri,
      state: sellerUserId
    });

    return {
      url: `https://partner.shopee.com/auth?${params.toString()}`,
      message: "Placeholder OAuth URL for Shopee"
    };
  }

  async shopeeCallback(code?: string, state?: string) {
    if (state) {
      const accessToken = `shopee_access_${code ?? "stub"}`;
      const refreshToken = `shopee_refresh_${code ?? "stub"}`;

      await this.prisma.marketplaceConnection.upsert({
        where: {
          sellerId_marketplace: {
            sellerId: state,
            marketplace: Marketplace.SHOPEE
          }
        },
        update: {
          status: ConnectionStatus.CONNECTED,
          accessTokenEncrypted: this.encryptToken(accessToken),
          refreshTokenEncrypted: this.encryptToken(refreshToken),
          tokenExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        },
        create: {
          sellerId: state,
          marketplace: Marketplace.SHOPEE,
          status: ConnectionStatus.CONNECTED,
          accessTokenEncrypted: this.encryptToken(accessToken),
          refreshTokenEncrypted: this.encryptToken(refreshToken),
          tokenExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        }
      });
    }

    return {
      message: "Shopee callback placeholder",
      code: code ?? null,
      state: state ?? null
    };
  }

  private encryptToken(value: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decryptToken(cipherText: string): string {
    const key = this.getEncryptionKey();
    const raw = Buffer.from(cipherText, "base64");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }

  private getEncryptionKey(): Buffer {
    const rawKey = this.configService.get<string>("MARKETPLACE_TOKEN_ENCRYPTION_KEY");
    if (!rawKey) {
      throw new InternalServerErrorException(
        "MARKETPLACE_TOKEN_ENCRYPTION_KEY is required"
      );
    }
    return createHash("sha256").update(rawKey).digest();
  }
}
