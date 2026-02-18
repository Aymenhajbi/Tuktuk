import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProcessSignalDto {
  @IsString()
  productId!: string;

  @IsString()
  keyword!: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  productName?: string;

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

  @IsNumber() @Min(0)
  activeAdsCount!: number;

  @IsNumber() @Min(0)
  competitorStoresCount!: number;

  @IsNumber() @Min(0) @Max(100)
  priceCompression!: number;
}
