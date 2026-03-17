export class CreateProductDto {
  name!: string;
  description?: string;
  price!: number;
  salePrice?: number;
  images?: string[];
  categoryId!: string;
  brand?: string;
  stock?: number;
  sku?: string;
  tags?: string[];
  featured?: boolean;
  active?: boolean;
}
