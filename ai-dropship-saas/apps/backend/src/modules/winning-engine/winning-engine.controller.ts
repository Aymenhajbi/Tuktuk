import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScoreProductDto } from './dto/score-product.dto';
import { WinningEngineService } from './winning-engine.service';

@ApiTags('winning-engine')
@Controller('modules/winning-engine')
export class WinningEngineController {
  constructor(private readonly service: WinningEngineService) {}

  @Post('score')
  score(@Body() dto: ScoreProductDto) {
    return this.service.calculateWinningScore(dto);
  }
}
