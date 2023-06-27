export type ProductListType = {
  products: ProductItem[];

  total: number;
  skip: number;
  limit: number;
};
export type ProductItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
};
