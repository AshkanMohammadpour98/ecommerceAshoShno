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

/* ==================================================
   PATCH → ویرایش محصول بر اساس _id
   پشتیبانی کامل از:
   - description.short
   - description.full
   - condition
================================================== */
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    // 🟢 دریافت id محصول از URL
    const { _id } = await params;

    // 🟢 دریافت داده‌ها به صورت FormData
    const formData = await req.formData();

    // 🟢 گرفتن محصول فعلی برای fallback
    const product = await Product.findById(_id);
    if (!product) {
      return NextResponse.json(
        { message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    /* =========================
       فیلدهای ساده
       اگر مقدار جدید نیامده → مقدار قبلی حفظ می‌شود
    ========================= */
    const title = formData.get("title") || product.title;
    const reviews = formData.get("reviews") || product.reviews;
    const price = formData.get("price") || product.price;
    const categorie = formData.get("categorie") || product.categorie;

    const hasDiscount = formData.get("hasDiscount") === "true";
    const discountedPrice =
      formData.get("discountedPrice") || product.discountedPrice;

    /* =========================
       🟢 description (خیلی مهم)
       اینجا مشکل اصلی حل شد
    ========================= */
    const descriptionShort =
      formData.get("descriptionShort") ||
      product.description?.short ||
      "";

    const descriptionFull =
      formData.get("descriptionFull") ||
      product.description?.full ||
      "";

    /* =========================
       🟢 condition
    ========================= */
    const condition =
      formData.get("condition") ||
      product.condition ||
      "نو آکبند";

   /* =========================
   تصاویر
   فقط ایندکس‌هایی که فایل جدید دارند تغییر می‌کنند
   🟢 تغییر جدید: اگر عکس قبلی وجود داشت، قبل از جایگزینی حذف می‌شود
   🟢 تغییر جدید: فولدر جدید ساخته نمی‌شود، عکس در همان فولدر قبلی جایگزین می‌شود
========================= */
let updatedThumbnails = [...(product.imgs?.thumbnails || [])];
let updatedPreviews = [...(product.imgs?.previews || [])];

for (let i = 0; i < 4; i++) {
  const thumbFile = formData.get(`thumb_${i}`);
  if (thumbFile && typeof thumbFile !== "string") {
    // 🟢 تعیین فولدر بر اساس عکس قبلی یا title
    let folderNameThumb = updatedThumbnails[i]
      ? updatedThumbnails[i].split("/uploads/products/")[1].split("/")[0] // فولدر موجود
      : title.replace(/\s+/g, "-"); // اگر عکس قبلی نبود، فولدر جدید بر اساس title ساخته می‌شود

    const saved = await saveFiles([thumbFile], folderNameThumb);

    // 🟢 حذف عکس قبلی قبل از جایگزینی با عکس جدید
    if (updatedThumbnails[i]) removeFile(updatedThumbnails[i]);

    // 🟢 جایگزینی عکس جدید
    updatedThumbnails[i] = saved[0];
  }

  const prevFile = formData.get(`prev_${i}`);
  if (prevFile && typeof prevFile !== "string") {
    // 🟢 تعیین فولدر بر اساس عکس قبلی یا title
    let folderNamePrev = updatedPreviews[i]
      ? updatedPreviews[i].split("/uploads/products/")[1].split("/")[0] // فولدر موجود
      : title.replace(/\s+/g, "-"); // اگر عکس قبلی نبود، فولدر جدید بر اساس title ساخته می‌شود

    const saved = await saveFiles([prevFile], folderNamePrev);

    // 🟢 حذف عکس قبلی قبل از جایگزینی با عکس جدید
    if (updatedPreviews[i]) removeFile(updatedPreviews[i]);

    // 🟢 جایگزینی عکس جدید
    updatedPreviews[i] = saved[0];
  }
}


    /* =========================
       بروزرسانی نهایی دیتابیس
    ========================= */
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        title,
        reviews,
        price,
        categorie,
        hasDiscount,
        discountedPrice,
        condition, // 🟢 جدید
        description: {
          short: descriptionShort, // 🟢 جدید
          full: descriptionFull,   // 🟢 جدید
        },
        imgs: {
          thumbnails: updatedThumbnails,
          previews: updatedPreviews,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "محصول با موفقیت بروزرسانی شد",
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "خطای سرور", error: error.message },
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
