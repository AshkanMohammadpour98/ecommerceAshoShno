// src/app/api/products/route.js



import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB";
import Products from "/models/Products";

/* =========================
   GET → دریافت همه محصولات
========================= */
export async function GET() {
  try {
    await connectDB();

    const products = await Products.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → افزودن محصول جدید
========================= */
export async function POST(req) {
  try {
    await connectDB();

    // 1️⃣ دریافت دیتا از فرانت
    const body = await req.json();

    /*
      2️⃣ نرمال‌سازی دیتا
      چون از فرم HTML بعضی چیزها string میان
    */
    const normalizedData = {
      ...body,
      price: Number(body.price),
      discountedPrice: Number(body.discountedPrice || 0),
      reviews: Number(body.reviews || 0),
      hasDiscount: Boolean(body.hasDiscount),
    };

    // 3️⃣ بررسی تکراری نبودن id فرانت
    const exists = await Products.findOne({ id: body.id });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "این محصول قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    // 4️⃣ ذخیره در MongoDB
    const product = await Products.create(normalizedData);

    // 5️⃣ پاسخ موفق
    return NextResponse.json(
      {
        success: true,
        message: "محصول با موفقیت اضافه شد ✅",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "افزودن محصول انجام نشد ❌",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
