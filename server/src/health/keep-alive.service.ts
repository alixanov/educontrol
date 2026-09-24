import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private timer: NodeJS.Timeout | null = null;

  onModuleInit() {
    // Render avtomatik tarzda RENDER_EXTERNAL_URL beradi (masalan: https://educontrol.onrender.com)
    const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

    if (!targetUrl) {
      this.logger.log("KeepAliveService: RENDER_EXTERNAL_URL yoki APP_URL aniqlanmadi (lokal rejim).");
      return;
    }

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const pingEndpoint = `${cleanUrl}/api/health`;

    this.logger.log(`KeepAliveService faollashtirildi: Har 10 daqiqada ${pingEndpoint} ga so'rov yuboriladi.`);

    // Har 10 daqiqada (Render 15 daqiqada uxlaydi, 10 daqiqa eng optimal)
    const INTERVAL_MS = 10 * 60 * 1000;

    this.timer = setInterval(async () => {
      try {
        const response = await fetch(pingEndpoint, {
          method: 'GET',
          headers: { 'User-Agent': 'EduControl-KeepAlive/1.0' },
        });
        if (response.ok) {
          this.logger.log(`[KeepAlive] Muvaffaqiyatli so'rov: ${pingEndpoint} (Status: ${response.status})`);
        } else {
          this.logger.warn(`[KeepAlive] Ogohlantirish: ${pingEndpoint} qaytardi ${response.status}`);
        }
      } catch (err: any) {
        this.logger.error(`[KeepAlive] So'rov xatosi: ${err?.message || err}`);
      }
    }, INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
