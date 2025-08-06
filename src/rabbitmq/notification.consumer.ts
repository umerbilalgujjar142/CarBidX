import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RedisService } from 'src/redis/redis.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern('notification_event')
  async handleNotification(@Payload() data: any) {
    try {
      if (data.type === 'bidUpdate') {
        // Update Redis cache with current bid
        await this.redisService.client.set(
          `auction:${data.auctionId}:currentBid`,
          data.amount,
        );

        // Publish bid update to Redis for WebSocket clients
        await this.redisService.pub.publish(
          `auction:${data.auctionId}:bids`,
          JSON.stringify({
            auctionId: data.auctionId,
            userId: data.userId,
            amount: data.amount,
            timestamp: data.timestamp,
          }),
        );
      } else if (data.type === 'bidError') {
        // Publish bid error to Redis for WebSocket clients
        await this.redisService.pub.publish(
          `auction:${data.data.auctionId}:bidError`,
          JSON.stringify({
            auctionId: data.data.auctionId,
            userId: data.data.userId,
            error: data.error,
            data: data.data,
          }),
        );
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }
}
