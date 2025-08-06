import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionService } from './auction.service';
import { RedisService } from 'src/redis/redis.service';
import { UseGuards } from '@nestjs/common';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@WebSocketGateway({ namespace: '/auction', cors: true })
export class AuctionGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly auctionService: AuctionService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    this.initializeGateway();
  }

  private async initializeGateway() {
    try {
      await this.auctionService.ensureDefaultAuction();
      await this.subscribeToAllAuctions();
    } catch (error) {}
  }

  private async subscribeToAllAuctions() {
    const auctions = await this.auctionService.getAllAuctions();
    auctions.forEach((auction) => {
      this.redisService.sub.subscribe(`auction:${auction.id}:bids`);
      this.redisService.sub.subscribe(`auction:${auction.id}:end`);
    });
    this.redisService.sub.on('message', (channel, message) => {
      if (channel.endsWith(':bids')) {
        const bid = JSON.parse(message);
        this.server.to(`auction_${bid.auctionId}`).emit('bidUpdate', bid);
      } else if (channel.endsWith(':end')) {
        const result = JSON.parse(message);
        this.server
          .to(`auction_${result.auctionId}`)
          .emit('auctionEnded', result);
      }
    });
  }

  @SubscribeMessage('resetAuction')
  async handleResetAuction(
    @MessageBody() data: { auctionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.auctionService.resetAuction(data.auctionId);
      this.server
        .to(`auction_${data.auctionId}`)
        .emit('auctionReset', { auctionId: data.auctionId });
      client.emit('auctionReset', { auctionId: data.auctionId });
    } catch (error) {}
  }

  @SubscribeMessage('joinAuction')
  async handleJoinAuction(
    @MessageBody() data: { auctionId: number; userId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`auction_${data.auctionId}`);
    const sessionData = {
      userId: data.userId || null,
      auctionId: data.auctionId,
      socketId: client.id,
      connectedAt: Date.now(),
    };
    await this.redisService.client.set(
      `session:${client.id}`,
      JSON.stringify(sessionData),
    );
    client.emit('joinedAuction', { auctionId: data.auctionId });
  }

  async handleDisconnect(client: Socket) {
    await this.redisService.client.del(`session:${client.id}`);
  }

  afterInit() {
    this.server.on('connection', (socket: Socket) => {
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  async getSession(socketId: string) {
    const data = await this.redisService.client.get(`session:${socketId}`);
    return data ? JSON.parse(data) : null;
  }

  @SubscribeMessage('placeBid')
  @UseGuards(RateLimitGuard) // Apply rate limiting guard , during testing comment this line if needed
  async handlePlaceBid(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.rabbitMQService.publishBid(data);
      this.server.to(`auction_${data.auctionId}`).emit('bidPending', data);
      client.emit('bidSubmitted', { success: true, data });
    } catch (error) {
      client.emit('bidError', {
        error: error.message,
        data: data,
        success: false,
      });
    }
  }

  @SubscribeMessage('auctionEnd')
  async handleAuctionEnd(
    @MessageBody() data: { auctionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.auctionService.endAuction(data.auctionId);
      this.server.to(`auction_${data.auctionId}`).emit('auctionEnded', result);
    } catch (error) {}
  }
}
