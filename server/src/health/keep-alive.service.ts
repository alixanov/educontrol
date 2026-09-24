import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private timer: NodeJS.Timeout | null = null;
  private initialTimeout: NodeJS.Timeout | null = null;

  onModuleInit() {
    // Render avtomatik tarzda RENDER_EXTERNAL_URL yoki RENDER_EXTERNAL_HOSTNAME taqdim etadi
    let targetUrl =
      process.env.RENDER_EXTERNAL_URL ||
      (process.env.RENDER_EXTERNAL_HOSTNAME
        ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
        : null) ||
      process.env.APP_URL ||
      process.env.URL;

    if (!targetUrl) {
      this.logger.log(
        "KeepAliveService: Tashqi domen aniqlanmadi (lokal rejim). Render'ga joylanganda avtomatik ulanadi.",
      );
      return;
    }

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const pingEndpoint = `${cleanUrl}/api/health`;

    this.logger.log(
      `[KeepAlive] 100% Avtomatik rejim faol: Har 8 daqiqada ${pingEndpoint} ga so'rov yuboriladi (Render 15 daqiqada uxlaydi).`,
    );

    const ping = async () => {
      try {
        const res = await fetch(pingEndpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'EduControl-Autonomous-KeepAlive/2.0',
            'Cache-Control': 'no-cache',
          },
        });
        if (res.ok) {
          this.logger.log(`[KeepAlive] Render uyg'oq saqlandi: ${pingEndpoint} [${res.status}]`);
        } else {
          this.logger.warn(`[KeepAlive] Server javobi: ${res.status}`);
        }
      } catch (err: any) {
        this.logger.error(`[KeepAlive] So'rov xatosi: ${err?.message || err}`);
      }
    };

    // Server yuklangach 20 soniyadan so'ng dastlabki so'rov
    this.initialTimeout = setTimeout(ping, 20000);

    // Har 8 daqiqada (480,000 ms) takrorlanadi — Render hech qachon uxlamaydi
    const INTERVAL_MS = 8 * 60 * 1000;
    this.timer = setInterval(ping, INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.initialTimeout) clearTimeout(this.initialTimeout);
    if (this.timer) clearInterval(this.timer);
  }
}
