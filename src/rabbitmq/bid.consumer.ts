import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RabbitMQService } from './rabbitmq.service';
import { WsException } from '@nestjs/websockets';

@Controller()
export class BidConsumer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @EventPattern('bid_event')
  async handleBid(@Payload() data: any) {
    try {
      const bid = await this.processBid(data);
      await this.rabbitMQService.publishNotification({
        type: 'bidUpdate',
        ...bid,
      });
    } catch (error) {
      // Publish error notification
      try {
        await this.rabbitMQService.publishNotification({
          type: 'bidError',
          error: error.message,
          data: data,
        });
      } catch {}
    }
  }

  private async processBid(data: {
    auctionId: number;
    userId: number;
    amount: number;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: data.auctionId },
      });
      if (!auction) {
        throw new WsException('Auction not found');
      }
      if (auction.status !== 'active') {
        throw new WsException('Auction is not active');
      }
      if (data.amount <= auction.currentBid) {
        throw new WsException('Bid must be higher than current bid');
      }
      const updatedAuction = await tx.auction.update({
        where: { id: data.auctionId },
        data: { currentBid: data.amount },
      });
      const bid = await tx.bid.create({
        data: {
          userId: data.userId,
          auctionId: data.auctionId,
          amount: data.amount,
          timestamp: new Date().toISOString(),
        },
      });
      setTimeout(async () => {
        await this.redisService.client.set(
          `auction:${data.auctionId}:currentBid`,
          data.amount,
        );
        await this.redisService.pub.publish(
          `auction:${data.auctionId}:bids`,
          JSON.stringify({
            auctionId: data.auctionId,
            userId: data.userId,
            amount: data.amount,
            timestamp: bid.timestamp,
          }),
        );
      }, 0);
      return {
        auctionId: data.auctionId,
        userId: data.userId,
        amount: data.amount,
        timestamp: bid.timestamp,
      };
    });
  }
}
