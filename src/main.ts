import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect to RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'bid_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start all microservices first
  await app.startAllMicroservices();
  // Logging removed for production
  // Then start the HTTP server
  await app.listen(process.env.PORT ?? 4000);
  // Logging removed for production
}
bootstrap();
