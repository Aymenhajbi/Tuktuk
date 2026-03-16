import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcessSignalDto } from './dto/process-signal.dto';
import { OrchestratorService } from './orchestrator.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('orchestrator')
@Roles('ADMIN')
@Controller('modules/orchestrator')
export class OrchestratorController {
  constructor(private readonly service: OrchestratorService) {}

  @Post('process-signal')
  processSignal(@Body() dto: ProcessSignalDto) {
    return this.service.processTrendSignal(dto);
  }
}
