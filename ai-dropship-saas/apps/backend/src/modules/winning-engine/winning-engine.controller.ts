import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScoreProductDto } from './dto/score-product.dto';
import { WinningEngineService } from './winning-engine.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('winning-engine')
@Roles('ADMIN')
@Controller('modules/winning-engine')
export class WinningEngineController {
  constructor(private readonly service: WinningEngineService) {}

  @Post('score')
  async score(@Body() dto: ScoreProductDto) {
    return this.service.calculateWinningScore(dto);
  }
}
