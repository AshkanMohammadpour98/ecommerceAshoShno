export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  hasDiscount : boolean
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
