export class CreateOrderDto {
  customerId!: string;
  address!: string;
  items!: Array<{ productId: string; quantity: number }>;
}
