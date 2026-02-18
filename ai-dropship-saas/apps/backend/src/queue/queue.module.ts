import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueStateRepository } from './queue-state.repository';

@Global()
@Module({
  providers: [QueueService, QueueStateRepository],
  exports: [QueueService],
})
export class QueueModule {}
