import { ConnectionStatus, Marketplace } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { IntegrationsService } from "./integrations.service";

describe("IntegrationsService", () => {
  const prisma = {
    marketplaceConnection: {
      upsert: jest.fn()
    }
  } as unknown as PrismaService;

  const configValues: Record<string, string> = {
    ML_CLIENT_ID: "ml_client_test",
    ML_REDIRECT_URI: "http://localhost:3000/integrations/mercadolivre/callback",
    SHOPEE_CLIENT_ID: "shopee_client_test",
    SHOPEE_REDIRECT_URI: "http://localhost:3000/integrations/shopee/callback",
    MARKETPLACE_TOKEN_ENCRYPTION_KEY: "test_encryption_key"
  };

  const config = {
    get: jest.fn((key: string, defaultValue?: string) => {
      return configValues[key] ?? defaultValue;
    })
  } as unknown as ConfigService;

  let service: IntegrationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IntegrationsService(prisma, config);
    (prisma.marketplaceConnection.upsert as jest.Mock).mockResolvedValue({});
  });

  it("connectMercadoLivre should set connection pending and return auth url", async () => {
    const result = await service.connectMercadoLivre("seller-123");

    expect(prisma.marketplaceConnection.upsert).toHaveBeenCalledWith({
      where: {
        sellerId_marketplace: {
          sellerId: "seller-123",
          marketplace: Marketplace.MERCADO_LIVRE
        }
      },
      update: { status: ConnectionStatus.PENDING },
      create: {
        sellerId: "seller-123",
        marketplace: Marketplace.MERCADO_LIVRE,
        status: ConnectionStatus.PENDING
      }
    });

    const url = new URL(result.url);
    expect(url.hostname).toBe("auth.mercadolivre.com.br");
    expect(url.searchParams.get("client_id")).toBe("ml_client_test");
    expect(url.searchParams.get("state")).toBe("seller-123");
  });

  it("connectShopee should set connection pending and return auth url", async () => {
    const result = await service.connectShopee("seller-321");

    expect(prisma.marketplaceConnection.upsert).toHaveBeenCalledWith({
      where: {
        sellerId_marketplace: {
          sellerId: "seller-321",
          marketplace: Marketplace.SHOPEE
        }
      },
      update: { status: ConnectionStatus.PENDING },
      create: {
        sellerId: "seller-321",
        marketplace: Marketplace.SHOPEE,
        status: ConnectionStatus.PENDING
      }
    });

    const url = new URL(result.url);
    expect(url.hostname).toBe("partner.shopee.com");
    expect(url.searchParams.get("partner_id")).toBe("shopee_client_test");
    expect(url.searchParams.get("state")).toBe("seller-321");
  });

  it("shopeeCallback should persist encrypted tokens when state is present", async () => {
    await service.shopeeCallback("abc", "seller-callback");

    expect(prisma.marketplaceConnection.upsert).toHaveBeenCalledTimes(1);

    const args = (prisma.marketplaceConnection.upsert as jest.Mock).mock.calls[0][0];
    expect(args.where).toEqual({
      sellerId_marketplace: {
        sellerId: "seller-callback",
        marketplace: Marketplace.SHOPEE
      }
    });
    expect(args.update.status).toBe(ConnectionStatus.CONNECTED);
    expect(args.create.status).toBe(ConnectionStatus.CONNECTED);

    const decryptedAccess = service.decryptToken(args.update.accessTokenEncrypted);
    const decryptedRefresh = service.decryptToken(args.update.refreshTokenEncrypted);
    expect(decryptedAccess).toBe("shopee_access_abc");
    expect(decryptedRefresh).toBe("shopee_refresh_abc");
  });

  it("shopeeCallback should be no-op when state is missing", async () => {
    const result = await service.shopeeCallback("abc");

    expect(prisma.marketplaceConnection.upsert).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: "Shopee callback placeholder",
      code: "abc",
      state: null
    });
  });
});
