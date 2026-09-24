import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

@Injectable()
export class LoginRateLimiterGuard implements CanActivate {
  private static attempts = new Map<string, AttemptRecord>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 2 * 60 * 1000; // 2 minutes
  private static readonly BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes block

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown-ip';

    const now = Date.now();
    const record = LoginRateLimiterGuard.attempts.get(ip);

    if (record) {
      if (record.blockedUntil && record.blockedUntil > now) {
        const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Qayta urinishlar soni oshib ketdi. Iltimos, ${remainingSeconds} soniyadan keyin qaytadan urinib ko'ring (Слишком много неудачных попыток. Повторите через ${remainingSeconds} сек).`,
            error: 'Too Many Requests',
            retryAfter: remainingSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Reset window if expired
      if (now - record.firstAttempt > LoginRateLimiterGuard.WINDOW_MS) {
        LoginRateLimiterGuard.attempts.delete(ip);
      }
    }

    return true;
  }

  static recordFailedAttempt(ip: string): void {
    const now = Date.now();
    let record = LoginRateLimiterGuard.attempts.get(ip);

    if (!record || now - record.firstAttempt > LoginRateLimiterGuard.WINDOW_MS) {
      record = { count: 1, firstAttempt: now };
    } else {
      record.count += 1;
      if (record.count >= LoginRateLimiterGuard.MAX_ATTEMPTS) {
        record.blockedUntil = now + LoginRateLimiterGuard.BLOCK_DURATION_MS;
      }
    }
    LoginRateLimiterGuard.attempts.set(ip, record);
  }

  static resetAttempts(ip: string): void {
    LoginRateLimiterGuard.attempts.delete(ip);
  }
}
