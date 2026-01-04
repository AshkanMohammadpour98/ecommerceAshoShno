// /api/products/[_id]/route.js
import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB"
import Product from "/models/Products";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import fs from "fs";
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL

/* =========================
   تابع کمکی برای حذف فیزیکی فایل‌ها
   ========================= */
const removeFile = (relativePath) => {
  try {
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`فایل حذف شد: ${relativePath}`);
    }
  } catch (err) {
    console.error(`خطا در حذف فایل: ${relativePath}`, err);
  }
};
/* =========================
   GET → دریافت یک محصول
   بر اساس id فرانت
========================= */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { _id } = await  params;
    console.log(_id);
  
    
    const product = await Product.findById(_id);
    console.log(product);
    

    if (!product) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}



/* ==================================================
   تابع کمکی برای ذخیره فایل‌ها (مشابه بخش POST)
   ================================================== */
async function saveFiles(files, subFolder) {
  const urls = [];
  const uploadDir = path.join(process.cwd(), "public/uploads/products", subFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const file of files) {
    // اگر ورودی فایل نبود یا فرمت رشته داشت (مثلاً آدرس قدیمی بود) رد شود
    if (!file || typeof file === "string") continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    urls.push(`/uploads/products/${subFolder}/${filename}`);
  }
  return urls;
}
/* =========================
   PATCH → ویرایش محصول
   (ویرایش جزئی)
========================= */
/* ==================================================
   PATCH → ویرایش محصول بر اساس _id
   ================================================== */
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    // ۱. استخراج _id (در نسخه های جدید Next.js باید await شود)
    const { _id } = await params;

    // ۲. دریافت داده‌های فرم
    const formData = await req.formData();

    // ۳. پیدا کردن محصول فعلی در دیتابیس
    const product = await Product.findById(_id);
    if (!product) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    // ۴. استخراج فیلدهای متنی
    const title = formData.get("title") || product.title;
    const reviews = formData.get("reviews") || product.reviews;
    const price = formData.get("price") || product.price;
    const discountedPrice = formData.get("discountedPrice") || 0;
    const hasDiscount = formData.get("hasDiscount") === "true";
    const categorie = formData.get("categorie") || product.categorie;

    // کپی از لیست تصاویر فعلی برای تغییر ایندکس‌های خاص
    let updatedThumbnails = [...(product.imgs?.thumbnails || ["", "", "", ""])];
    let updatedPreviews = [...(product.imgs?.previews || ["", "", "", ""])];

    // ۵. پردازش تصاویر Thumbnail (اگر فایل جدیدی فرستاده شده باشد)
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`thumb_${i}`);
      if (file && typeof file !== "string") {
        // استفاده از تابع saveFiles شما (خروجی آن آرایه است)
        const savedPath = await saveFiles([file], title.replace(/\s+/g, "-"));
        updatedThumbnails[i] = savedPath[0]; // جایگزین کردن در همان ایندکس
      }
    }

    // ۶. پردازش تصاویر Preview (اگر فایل جدیدی فرستاده شده باشد)
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`prev_${i}`);
      if (file && typeof file !== "string") {
        const savedPath = await saveFiles([file], title.replace(/\s+/g, "-"));
        updatedPreviews[i] = savedPath[0];
      }
    }

    // ۷. بروزرسانی نهایی در دیتابیس
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        title,
        reviews,
        price,
        discountedPrice,
        hasDiscount,
        categorie,
        imgs: {
          thumbnails: updatedThumbnails,
          previews: updatedPreviews,
        },
      },
      { new: true } // برگرداندن دیتای جدید بعد از آپدیت
    );

    return NextResponse.json(
      { message: "محصول با موفقیت بروزرسانی شد", data: updatedProduct },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in PATCH Product:", error);
    return NextResponse.json(
      { message: "خطای سرور در ویرایش محصول", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → حذف کامل محصول و فایل‌های مرتبط
========================= */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { _id } =  await params;

    // 1. پیدا کردن محصول قبل از حذف برای دسترسی به آدرس تصاویر
    const product = await Product.findById(_id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    // 2. حذف فیزیکی تصاویر Thumbnails از پوشه
    if (product.imgs?.thumbnails && Array.isArray(product.imgs.thumbnails)) {
      product.imgs.thumbnails.forEach((path) => removeFile(path));
    }

    // 3. حذف فیزیکی تصاویر Previews از پوشه
    if (product.imgs?.previews && Array.isArray(product.imgs.previews)) {
      product.imgs.previews.forEach((path) => removeFile(path));
    }

    // 4. حذف محصول از دیتابیس MongoDB
    await Product.findByIdAndDelete(_id);

    // 5. تعامل با API دسته‌بندی (طبق درخواست شما)
    // نکته: اگر نیاز دارید آیتمی از دسته‌بندی‌ها کم شود، اینجا باید ریکوئست بزنید
    try {
       await fetch(`${BASE_URL}${CATEGORYS_URL}`, {
         method: 'DELETE',
         body: JSON.stringify({ categoryName: product.categorie }),
         headers: { 'Content-Type': 'application/json' }
       });
    } catch (catErr) {
       console.log("خطا در آپدیت دسته‌بندی، اما محصول حذف شد.");
    }

    return NextResponse.json(
      { success: true, message: "محصول و تمامی تصاویر مرتبط با موفقیت حذف شدند" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
