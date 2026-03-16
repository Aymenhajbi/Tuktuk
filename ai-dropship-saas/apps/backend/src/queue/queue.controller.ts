import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { Roles } from '../modules/auth/decorators/roles.decorator';

@ApiTags('queues')
@Roles('ADMIN')
@Controller('modules/queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('status')
  getStatus() {
    return this.queueService.getQueueStatus();
  }
}
