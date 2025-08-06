import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

const bidCounts: Record<string, { count: number; lastReset: number }> = {};

const WINDOW_MS = 10000;
const MAX_BIDS = 5;

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const ip = client.handshake?.address || 'unknown';

    const now = Date.now();
    if (!bidCounts[ip] || now - bidCounts[ip].lastReset > WINDOW_MS) {
      bidCounts[ip] = { count: 1, lastReset: now };
      return true;
    }

    if (bidCounts[ip].count < MAX_BIDS) {
      bidCounts[ip].count += 1;
      return true;
    }

    return false;
  }
}
