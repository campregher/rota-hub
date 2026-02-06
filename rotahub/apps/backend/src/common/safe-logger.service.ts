import { Injectable, Logger, LoggerService } from '@nestjs/common';

const SENSITIVE_KEYS = ['password', 'passwordHash', 'accessToken', 'refreshToken', 'token'];

function maskSensitive(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(maskSensitive);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => {
        if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          return [key, '[REDACTED]'];
        }
        return [key, maskSensitive(val)];
      })
    );
  }
  return value;
}

@Injectable()
export class SafeLogger extends Logger implements LoggerService {
  log(message: unknown, context?: string) {
    super.log(maskSensitive(message), context);
  }

  warn(message: unknown, context?: string) {
    super.warn(maskSensitive(message), context);
  }

  error(message: unknown, trace?: string, context?: string) {
    super.error(maskSensitive(message), trace, context);
  }
}
