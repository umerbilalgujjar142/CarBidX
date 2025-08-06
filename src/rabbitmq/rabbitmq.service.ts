import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  public client: ClientProxy;

  async onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'bid_queue',
        queueOptions: { durable: true },
      },
    });
    try {
      await this.client.connect();
    } catch (error) {}
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  async publishBid(bid: any) {
    try {
      return await this.client.emit('bid_event', bid).toPromise();
    } catch (error) {
      throw error;
    }
  }

  async publishNotification(notification: any) {
    try {
      return await this.client
        .emit('notification_event', notification)
        .toPromise();
    } catch (error) {
      throw error;
    }
  }
}
