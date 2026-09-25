export interface VariantItem {
  id: string;
  color: string;
  storage: string;
  original_price: number;
  price: number;
  discount_percent: number;
  stock?: number;
  sku?: string;
  image?: string;
}

export interface ColorImageItem {
  id: string;
  folder?: string;
  sku?: string;
  colorName: string;
  imageUrl: string;
}

export interface SpecificationItem {
  label: string;
  value: string;
}

export interface SpecificationGroup {
  name: string;
  items: SpecificationItem[];
}

export interface ProductDetailData {
  id: number | string;
  name: string;
  slug: string;
  brand: string;
  image: string;
  price: number;
  original_price: number;
  discount_percent: number;
  stock: number;
  inStock: boolean;
  installment0?: boolean;
  specifications?: string;
  youtubeId?: string;
  skus?: string[];
  folders?: string[];
  variants?: VariantItem[];
  colorImages?: ColorImageItem[];
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  verified?: boolean;
}
