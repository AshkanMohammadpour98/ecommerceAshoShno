// /api/products/route.js
import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB";
import Products from "/models/Products";

// 🟢 ابزارهای لازم برای ذخیره فایل
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

/* =========================
   تابع ذخیره فایل روی سرور
   - فایل را در public ذخیره می‌کند
   - آدرس فایل را برمی‌گرداند
========================= */
async function saveFiles(files, folder) {
  const urls = [];

  for (const file of files) {
    if (!file) continue;

    // 🟡 اطمینان از اینکه فایل تصویر است
    if (!file.type.startsWith("image/")) {
      throw new Error("فایل ارسالی تصویر نیست");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);

    // 🟢 نام یکتا برای جلوگیری از تداخل
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;

    const uploadPath = path.join(
      process.cwd(),
      "public/uploads/products",
      folder
    );

    await writeFile(`${uploadPath}/${filename}`, buffer);

    // 🟢 ذخیره فقط URL در دیتابیس
    urls.push(`/uploads/products/${folder}/${filename}`);
  }

  return urls;
}

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
   (پشتیبانی از FormData + عکس)
========================= */
export async function POST(req) {
  try {
    await connectDB();

    // 🟢 دریافت FormData (نه JSON)
    const data = await req.formData();

    // 🟢 ذخیره عکس‌ها روی File System
    const thumbnails = await saveFiles(
      data.getAll("thumbnails"),
      "thumbnails"
    );
    const previews = await saveFiles(
      data.getAll("previews"),
      "previews"
    );

    // 🟢 آماده‌سازی داده محصول
    const productData = {
      id: data.get("id"),
      title: data.get("title"),
      content: data.get("content"),
      categorie: data.get("categorie"),
      date: data.get("date"),

      price: Number(data.get("price")),
      reviews: Number(data.get("reviews")),
      count: Number(data.get("count") || 1), //  count اضافه شد
      hasDiscount: data.get("hasDiscount") === "true",
      discountedPrice: data.get("discountedPrice")
        ? Number(data.get("discountedPrice"))
        : null,

      imgs: {
        thumbnails,
        previews,
      },
    };
    
    console.log(productData);
    

    // 🟢 ذخیره در MongoDB
    const product = await Products.create(productData);

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
