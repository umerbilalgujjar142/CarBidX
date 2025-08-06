import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { BidConsumer } from './bid.consumer';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationConsumer } from './notification.consumer';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [RabbitMQService, BidConsumer, NotificationConsumer],
  controllers: [BidConsumer, NotificationConsumer],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
