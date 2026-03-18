import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SearchProductsDto {
  @IsString()
  @IsNotEmpty()
  keyword!: string;

  /** Warehouse filter: 'oversea' | 'CN' | 'US' | 'DE' | 'GB' | 'AU' | 'all'
   *  Falls back gracefully for any unknown value. */
  @IsOptional()
  @IsString()
  warehouse?: string;
}
