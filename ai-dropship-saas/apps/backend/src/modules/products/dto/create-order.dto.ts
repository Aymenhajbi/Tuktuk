import { IsString, IsArray, ValidateNested, IsInt, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  // customerId is set server-side from the JWT — not accepted from the client
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;
}
