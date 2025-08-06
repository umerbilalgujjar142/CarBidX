import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { WsException } from '@nestjs/websockets';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllAuctions() {
    return this.prisma.auction.findMany();
  }

  async createAuction(data: CreateAuctionDto) {
    return this.prisma.auction.create({ data });
  }

  async ensureDefaultAuction() {
    const existingAuction = await this.prisma.auction.findFirst({
      where: { id: 1 },
    });

    if (!existingAuction) {
      return this.prisma.auction.create({
        data: {
          id: 1,
          carId: 1,
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          startingBid: 5000,
          currentBid: 6000,
          status: 'active',
        },
      });
    }

    return existingAuction;
  }

  async processBid(data: {
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

      // Optimistic locking: update only if currentBid is still the same
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

      // Redis logic after transaction commit
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

  async resetAuction(auctionId: number) {
    await this.prisma.bid.deleteMany({
      where: { auctionId },
    });

    await this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        status: 'active',
        currentBid: 6000,
        winnerId: null,
      },
    });
  }

  async endAuction(auctionId: number) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      throw new WsException('Auction not found');
    }

    if (auction.status === 'ended') {
      return { auctionId, status: 'ended', winnerId: auction.winnerId };
    }

    const highestBid = await this.prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
    });

    let updatedAuction;
    if (highestBid) {
      updatedAuction = await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ended',
          winnerId: highestBid.userId,
          currentBid: highestBid.amount,
        },
      });

      // Redis: update cache for currentBid and winnerId
      await this.redisService.client.set(
        `auction:${auctionId}:currentBid`,
        highestBid.amount,
      );
      await this.redisService.client.set(
        `auction:${auctionId}:winnerId`,
        highestBid.userId,
      );
      // Redis: publish auction end event
      await this.redisService.pub.publish(
        `auction:${auctionId}:end`,
        JSON.stringify({
          auctionId,
          winnerId: highestBid.userId,
          amount: highestBid.amount,
        }),
      );
      return {
        auctionId,
        status: 'ended',
        winnerId: highestBid.userId,
        amount: highestBid.amount,
      };
    } else {
      updatedAuction = await this.prisma.auction.update({
        where: { id: auctionId },
        data: { status: 'ended', winnerId: null },
      });

      await this.redisService.client.set(
        `auction:${auctionId}:currentBid`,
        5000,
      );
      await this.redisService.client.set(`auction:${auctionId}:winnerId`, null);
      await this.redisService.pub.publish(
        `auction:${auctionId}:end`,
        JSON.stringify({
          auctionId,
          winnerId: null,
          amount: 5000,
        }),
      );
      return {
        auctionId,
        status: 'ended',
        winnerId: null,
        amount: 5000,
      };
    }
  }
}
