import { Global, Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueStateRepository } from './queue-state.repository';

@Global()
@Module({
  controllers: [QueueController],
  providers: [QueueService, QueueStateRepository],
  exports: [QueueService],
})
export class QueueModule {}
