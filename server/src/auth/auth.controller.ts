import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LoginRateLimiterGuard } from './rate-limiter.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LoginRateLimiterGuard)
  async login(@Body() body: LoginDto, @Req() req: any) {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown-ip';

    try {
      const result = await this.authService.login(body.email, body.password);
      LoginRateLimiterGuard.resetAttempts(ip);
      return result;
    } catch (err) {
      LoginRateLimiterGuard.recordFailedAttempt(ip);
      throw err;
    }
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: any) {
    // If admins already exist, protect registration so unauthorized users cannot create admin accounts
    const adminCount = await this.authService.getAdminCount();
    if (adminCount > 0) {
      const authHeader = req.headers['authorization'];
      const token =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.substring(7)
          : null;
      if (!token) {
        throw new UnauthorizedException(
          'Yangi administrator yaratish uchun tizimga kirish talab qilinadi (Требуется авторизация для создания администратора)',
        );
      }
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new UnauthorizedException(
          'Yaroqsiz avtorizatsiya tokeni (Недействительный токен авторизации)',
        );
      }
    }
    return this.authService.registerAdmin(body.email, body.password, body.name);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return { user: req.user };
  }
}
