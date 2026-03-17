import { Injectable } from '@nestjs/common';

export interface CJProduct {
  cjId: string;
  name: string;
  images: string[];
  supplierPriceUSD: number;
  suggestedPriceAED: number;
  categoryName: string;
  warehouse: string;
  shippingDays: string;
  rating: number;
}

// AED = USD × 3.67 FX × 2.5× markup
const toAED = (usd: number) => Math.round(usd * 3.67 * 2.5);

// Mock catalogue — realistic UAE-warehouse products across all categories
const MOCK_CATALOGUE: CJProduct[] = [
  {
    cjId: 'CJ-10045231', name: 'Smart WiFi LED Strip Lights 5M RGB Color Changing',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
             'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400'],
    supplierPriceUSD: 8.50, suggestedPriceAED: toAED(8.50),
    categoryName: 'Electronics', warehouse: 'oversea', shippingDays: '3-7', rating: 4.6,
  },
  {
    cjId: 'CJ-10038872', name: 'Wireless Earbuds Bluetooth 5.3 Noise Cancelling TWS',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
             'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    supplierPriceUSD: 12.00, suggestedPriceAED: toAED(12.00),
    categoryName: 'Electronics', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10029104', name: 'Magnetic Car Phone Holder 360° Dashboard Mount',
    images: ['https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=400'],
    supplierPriceUSD: 3.50, suggestedPriceAED: toAED(3.50),
    categoryName: 'Automotive', warehouse: 'oversea', shippingDays: '3-7', rating: 4.4,
  },
  {
    cjId: 'CJ-10051887', name: 'Portable Mini Neck Fan USB Rechargeable Bladeless',
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400'],
    supplierPriceUSD: 9.50, suggestedPriceAED: toAED(9.50),
    categoryName: 'Electronics', warehouse: 'oversea', shippingDays: '3-7', rating: 4.3,
  },
  {
    cjId: 'CJ-10067342', name: 'Smart Watch Fitness Tracker Heart Rate Blood Oxygen',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
             'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400'],
    supplierPriceUSD: 18.00, suggestedPriceAED: toAED(18.00),
    categoryName: 'Electronics', warehouse: 'oversea', shippingDays: '3-7', rating: 4.7,
  },
  {
    cjId: 'CJ-10012345', name: '3-in-1 Fast Charging Cable USB-C Lightning MicroUSB 1.2M',
    images: ['https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400'],
    supplierPriceUSD: 2.80, suggestedPriceAED: toAED(2.80),
    categoryName: 'Electronics', warehouse: 'CN', shippingDays: '7-14', rating: 4.2,
  },
  {
    cjId: 'CJ-10088923', name: 'Resistance Loop Bands Set 5 Levels Fabric Glutes',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'],
    supplierPriceUSD: 4.50, suggestedPriceAED: toAED(4.50),
    categoryName: 'Sports', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10076512', name: 'Insulated Stainless Steel Water Bottle 750ml Leak-Proof',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'],
    supplierPriceUSD: 6.00, suggestedPriceAED: toAED(6.00),
    categoryName: 'Sports', warehouse: 'oversea', shippingDays: '3-7', rating: 4.6,
  },
  {
    cjId: 'CJ-10043219', name: 'Digital Kitchen Scale 5kg Precision 1g Tare Function',
    images: ['https://images.unsplash.com/photo-1611784728558-6a9848d4c72d?w=400'],
    supplierPriceUSD: 8.00, suggestedPriceAED: toAED(8.00),
    categoryName: 'Home & Living', warehouse: 'oversea', shippingDays: '3-7', rating: 4.4,
  },
  {
    cjId: 'CJ-10034567', name: 'Bamboo Cutting Board Set 3-Piece with Juice Grooves',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
    supplierPriceUSD: 9.50, suggestedPriceAED: toAED(9.50),
    categoryName: 'Home & Living', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10098234', name: 'Vitamin C Brightening Face Serum 30ml Anti-Aging',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
             'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
    supplierPriceUSD: 7.50, suggestedPriceAED: toAED(7.50),
    categoryName: 'Beauty', warehouse: 'oversea', shippingDays: '3-7', rating: 4.7,
  },
  {
    cjId: 'CJ-10056781', name: 'Hyaluronic Acid Moisturizer Cream Deep Hydration 50ml',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'],
    supplierPriceUSD: 8.50, suggestedPriceAED: toAED(8.50),
    categoryName: 'Beauty', warehouse: 'oversea', shippingDays: '3-7', rating: 4.6,
  },
  {
    cjId: 'CJ-10023456', name: 'Rose Quartz Jade Facial Roller & Gua Sha Set',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400'],
    supplierPriceUSD: 5.50, suggestedPriceAED: toAED(5.50),
    categoryName: 'Beauty', warehouse: 'oversea', shippingDays: '3-7', rating: 4.4,
  },
  {
    cjId: 'CJ-10087654', name: 'Silk Sleep Eye Mask Blackout Adjustable Strap',
    images: ['https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400'],
    supplierPriceUSD: 3.20, suggestedPriceAED: toAED(3.20),
    categoryName: 'Beauty', warehouse: 'oversea', shippingDays: '3-7', rating: 4.3,
  },
  {
    cjId: 'CJ-10065432', name: "Men's Breathable Polo Shirt Slim Fit Summer Casual",
    images: ['https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=400'],
    supplierPriceUSD: 8.00, suggestedPriceAED: toAED(8.00),
    categoryName: 'Fashion', warehouse: 'oversea', shippingDays: '3-7', rating: 4.3,
  },
  {
    cjId: 'CJ-10076890', name: "Women's High-Waist Linen Wide-Leg Pants Loose Fit",
    images: ['https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400'],
    supplierPriceUSD: 10.00, suggestedPriceAED: toAED(10.00),
    categoryName: 'Fashion', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10021987', name: 'Large Canvas Tote Bag Shoulder Zipper Reusable',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'],
    supplierPriceUSD: 5.50, suggestedPriceAED: toAED(5.50),
    categoryName: 'Fashion', warehouse: 'CN', shippingDays: '7-14', rating: 4.2,
  },
  {
    cjId: 'CJ-10054321', name: 'Wide Brim Straw Beach Hat UV Protection Foldable',
    images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400'],
    supplierPriceUSD: 6.50, suggestedPriceAED: toAED(6.50),
    categoryName: 'Fashion', warehouse: 'oversea', shippingDays: '3-7', rating: 4.4,
  },
  {
    cjId: 'CJ-10032145', name: 'Car Aromatherapy Air Freshener Vent Clip Diffuser',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'],
    supplierPriceUSD: 5.50, suggestedPriceAED: toAED(5.50),
    categoryName: 'Automotive', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10078965', name: 'Cable Management Box Organizer with 6 Outlet Surge Protector',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    supplierPriceUSD: 7.00, suggestedPriceAED: toAED(7.00),
    categoryName: 'Home & Living', warehouse: 'oversea', shippingDays: '3-7', rating: 4.3,
  },
  {
    cjId: 'CJ-10043871', name: 'Posture Corrector Back Brace Adjustable Shoulder Support',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'],
    supplierPriceUSD: 9.00, suggestedPriceAED: toAED(9.00),
    categoryName: 'Sports', warehouse: 'oversea', shippingDays: '3-7', rating: 4.6,
  },
  {
    cjId: 'CJ-10019234', name: 'Speed Jump Rope Weighted Handles Adjustable Steel Cable',
    images: ['https://images.unsplash.com/photo-1598889972250-f53a6cb82bd4?w=400'],
    supplierPriceUSD: 5.50, suggestedPriceAED: toAED(5.50),
    categoryName: 'Sports', warehouse: 'oversea', shippingDays: '3-7', rating: 4.4,
  },
  {
    cjId: 'CJ-10067123', name: 'Reusable Silicone Food Storage Bags Set of 6 Leak-Proof',
    images: ['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400'],
    supplierPriceUSD: 7.50, suggestedPriceAED: toAED(7.50),
    categoryName: 'Home & Living', warehouse: 'oversea', shippingDays: '3-7', rating: 4.5,
  },
  {
    cjId: 'CJ-10088001', name: 'Makeup Brush Set 12pcs Professional Synthetic Vegan',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'],
    supplierPriceUSD: 6.50, suggestedPriceAED: toAED(6.50),
    categoryName: 'Beauty', warehouse: 'oversea', shippingDays: '3-7', rating: 4.6,
  },
  {
    cjId: 'CJ-10055678', name: 'Portable Blender USB Rechargeable Smoothie Bottle 380ml',
    images: ['https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=400'],
    supplierPriceUSD: 14.00, suggestedPriceAED: toAED(14.00),
    categoryName: 'Home & Living', warehouse: 'oversea', shippingDays: '3-7', rating: 4.7,
  },
];

@Injectable()
export class ScraperService {
  searchProducts(keyword: string, warehouse?: string): { products: CJProduct[]; total: number } {
    const kw = keyword.toLowerCase().trim();

    let results = MOCK_CATALOGUE.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.categoryName.toLowerCase().includes(kw),
    );

    if (warehouse && warehouse !== 'all') {
      results = results.filter(p => p.warehouse === warehouse);
    }

    return { products: results, total: results.length };
  }
}
