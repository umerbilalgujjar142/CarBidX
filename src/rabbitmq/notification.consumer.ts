import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationConsumer {
  @EventPattern('notification_event')
  async handleNotification(@Payload() data: any) {
    // Log removed
  }
}
