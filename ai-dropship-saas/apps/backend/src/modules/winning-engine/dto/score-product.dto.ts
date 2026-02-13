import { IsNumber, IsString, Max, Min } from 'class-validator';

export class ScoreProductDto {
  @IsString()
  productId!: string;

  @IsNumber() @Min(0) @Max(100)
  trendVelocity!: number;

  @IsNumber() @Min(0) @Max(100)
  engagementRate!: number;

  @IsNumber() @Min(0) @Max(100)
  adFrequency!: number;

  @IsNumber() @Min(0) @Max(100)
  marginPotential!: number;

  @IsNumber() @Min(0) @Max(100)
  supplierScore!: number;

  @IsNumber() @Min(0) @Max(100)
  lowCompetitionFactor!: number;

  @IsNumber() @Min(0) @Max(100)
  sentimentScore!: number;
}
