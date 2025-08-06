import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionGateway } from './auction.gateway';
import { RedisModule } from '../../redis/redis.module';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
@Module({
  imports: [RedisModule],
  providers: [AuctionGateway, AuctionService, RabbitMQService],
  controllers: [AuctionController],
  exports: [AuctionService, RabbitMQService],
})
export class AuctionModule {}
