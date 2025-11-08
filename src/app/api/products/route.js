// src/app/api/products/route.js

// دیتای نمونه محصول‌ها که به صورت آرایه از آبجکت‌ها ذخیره شده
export const productsData = [
  {
    title: "Havit HV-G69 USB Gamepad2",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 1,
    categorie: "Any",
    imgs: {
      thumbnails: [
        "/images/products/product-1-sm-1.png",
        "/images/products/product-1-sm-2.png",
      ],
      previews: [
        "/images/products/product-1-bg-1.png",
        "/images/products/product-1-bg-2.png",
      ],
    },
  },
  {
    title: "iPhone 14 Plus , 6/128GB",
    reviews: 5,
    price: 899.0,
    discountedPrice: 99.0,
    id: 2,
    categorie: "Phone",
    imgs: {
      thumbnails: [
        "/images/products/product-2-sm-1.png",
        "/images/products/product-2-sm-2.png",
      ],
      previews: [
        "/images/products/product-2-bg-1.png",
        "/images/products/product-2-bg-2.png",
      ],
    },
  },
  // بقیه محصولات...
];

// 👉 متد GET برای گرفتن همه محصولات
export async function GET() {
  // اینجا فقط کل آرایه productsData رو برمی‌گردونیم
  return Response.json(productsData);
}

// 👉 متد POST برای اضافه کردن محصول جدید
export async function POST(request) {
  try {
    // گرفتن body ریکوئست به صورت json
    const newProduct = await request.json();

    // ایجاد یک id جدید برای محصول (به صورت خودکار +۱ از آخرین محصول)
    newProduct.id = productsData.length
      ? productsData[productsData.length - 1].id + 1
      : 1;

    // اضافه کردن محصول به آرایه اصلی
    productsData.push(newProduct);

    // برگرداندن پاسخ با محصول جدید و status 201 (Created)
    return Response.json(
      {
        message: "محصول با موفقیت اضافه شد ✅",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    // اگر خطا پیش اومد، خطا رو برمی‌گردونیم
    return Response.json(
      {
        message: "خطا در پردازش درخواست ❌",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
