import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';

@ApiTags('queues')
@Controller('modules/queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('status')
  getStatus() {
    return this.queueService.getQueueStatus();
  }
}
