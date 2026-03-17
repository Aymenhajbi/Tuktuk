import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class SearchProductsDto {
  @IsString()
  @IsNotEmpty()
  keyword!: string;

  @IsOptional()
  @IsIn(['oversea', 'CN', 'US'])
  warehouse?: string;
}
