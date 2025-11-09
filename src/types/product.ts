export type Product = {
  title: string;
  count: number;
  reviews: number;
  price: number;
  discountedPrice: number;
  hasDiscount: boolean;
  id: string; // قبلاً number بود، ولی در داده string است
  categorie: string;
  date: string; // تاریخ شمسی (مثلاً "1404/01/01")

  imgs: {
    thumbnails: string[];
    previews: string[];
  };

  QRDatas?: {
    id: string;
    name: string;
    config: {
      v: number;
      value: string;
      ecc: "L" | "M" | "Q" | "H"; // استاندارد QR error correction levels
      colors: {
        fg: string;
        bg: string;
      };
    };
    preview: {
      url: string; // base64 image
      width: number;
      height: number;
      mime: string;
    };
    dateAddQrCode: string; // تاریخ شمسی
  };
};
