import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.normalizeDatabaseUrl();

    try {
      await this.$connect();
      this.logger.log("Prisma connected");
    } catch (error) {
      this.logger.error(this.buildConnectionHints(error));
      throw error;
    }
  }

  private normalizeDatabaseUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      return;
    }

    let normalized = raw.trim();

    if (normalized.startsWith("DATABASE_URL=")) {
      normalized = normalized.slice("DATABASE_URL=".length).trim();
    }

    if (
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
      normalized = normalized.slice(1, -1).trim();
    }

    if (normalized !== raw) {
      process.env.DATABASE_URL = normalized;
      this.logger.warn(
        "DATABASE_URL had extra wrapper/prefix and was normalized at runtime"
      );
    }

    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname || "<empty-host>";
      const port = parsed.port || "<default-port>";
      const user = parsed.username || "<empty-user>";
      this.logger.log(`Database target host=${host} port=${port} user=${user}`);

      if (host.includes("pooler.supabase.com") && !user.includes(".")) {
        this.logger.warn(
          "Supabase pooler detected. Expected username format: postgres.<project_ref>"
        );
      }
    } catch {
      this.logger.warn("DATABASE_URL is not parseable as URL");
    }
  }

  private buildConnectionHints(error: unknown): string {
    const base = "Prisma connection failed.";
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("must start with the protocol")) {
      return `${base} Check DATABASE_URL format: no quotes, no leading DATABASE_URL=, and must start with postgresql://`;
    }

    if (message.includes("Tenant or user not found")) {
      return `${base} Supabase pooler username is invalid. Use postgres.<project_ref> and a valid database password.`;
    }

    if (message.includes("Can't reach database server")) {
      return `${base} Host/port/network issue. Verify DATABASE_URL host and SSL mode, and Supabase network restrictions.`;
    }

    return `${base} ${message}`;
  }
}
