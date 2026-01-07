// /api/blogs/route.js

import { writeFile } from "fs/promises";
// برای ذخیره فایل روی هارد سرور (async)

import path from "path";
// برای ساخت مسیر امن (cross-platform)

import Blog from "/models/Blogs";
import connectDB from "/utils/ConnectDB";



export async function GET(request) {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // 1. استخراج پارامترها از URL
    const { searchParams } = new URL(request.url);
    
    // دریافت کلمه کلیدی جستجو
    const searchTerm = searchParams.get("search"); 
    
    // دریافت تمام مقادیر 'cat' به صورت یک آرایه
    // اگر URL این باشد: ?cat=A&cat=B خروجی ["A", "B"] خواهد بود
    const selectedCategories = searchParams.getAll("cat");

    // 2. ساختن شیء نهایی کوئری (Filter Object)
    let query = {};

    // --- فیلتر دسته‌بندی (چند انتخابی) ---
    if (selectedCategories.length > 0) {
      // استفاده از $in: رکورد باید شامل یکی از مقادیر این آرایه باشد
      query.categorie = { $in: selectedCategories };
    }

    // --- فیلتر جستجوی متنی ---
    if (searchTerm) {
      // استفاده از $or: جستجو در عنوان یا محتوا
      query.$and = query.$and || []; // اطمینان از وجود $and برای ترکیب با دسته‌بندی
      query.$and.push({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } }
        ]
      });
    }

    // نکته آموزشی: اگر هم دسته‌بندی انتخاب شده باشد و هم جستجو،
    // مونگودی‌بی به صورت خودکار بین فیلد categorie و سایر فیلترها AND برقرار می‌کند.

    // 3. اجرای کوئری با مرتب‌سازی (جدیدترین‌ها اول)
    const blogs = await Blog.find(query).sort({ _id: -1 });

    // ✅ پاسخ موفق
    return Response.json(
      {
        success: true,
        count: blogs.length,
        data: blogs,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in GET blogs API:", error);
    return Response.json(
      {
        success: false,
        error: "خطا در دریافت اطلاعات از سرور",
        message: error.message
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   📤 POST /api/blogs
   ساخت بلاگ جدید + آپلود تصویر
   ===================================================== */
export async function POST(request) {
  try {
    // 🔹 اتصال به دیتابیس MongoDB
    await connectDB();

    // 🔹 گرفتن داده‌های ارسالی به صورت FormData
    // چون از فرانت FormData فرستاده شده (multipart/form-data)
    const formData = await request.formData();

    // 🔹 گرفتن فیلدهای متنی
    const title = formData.get("title");
    const content = formData.get("content");
    const categorie = formData.get("categorie");
    const date = formData.get("date");
    const views = formData.get("views");

    // 🔹 گرفتن فایل تصویر (File object)
    const imgFile = formData.get("img");

    // 🛑 اعتبارسنجی اولیه
    if (!title || !content || !imgFile) {
      return Response.json(
        { error: "عنوان، محتوا و تصویر الزامی است" },
        { status: 400 }
      );
    }

    /* ===============================
       🖼️ ذخیره تصویر روی سرور
       =============================== */

    // 🔹 تبدیل File به ArrayBuffer
    const bytes = await imgFile.arrayBuffer();

    // 🔹 تبدیل ArrayBuffer به Buffer (برای fs)
    const buffer = Buffer.from(bytes);

    // 🔹 ساخت نام یکتای فایل (جلوگیری از تداخل نام‌ها)
    const fileName = `${Date.now()}-${imgFile.name}`;

    // 🔹 مسیر ذخیره فایل
    // process.cwd() = ریشه پروژه Next.js
    const uploadPath = path.join(
      process.cwd(),
      "public/uploads/blogs",
      fileName
    );

    // 🔹 نوشتن فایل روی هارد
    await writeFile(uploadPath, buffer);

    /* ===============================
       🧠 ذخیره اطلاعات بلاگ در دیتابیس
       =============================== */

    const newBlog = await Blog.create({
      title,
      content,
      categorie,
      date,
      views,
      // فقط مسیر عکس ذخیره می‌شود (نه خود فایل)
      img: `/uploads/blogs/${fileName}`,
    });

    // ✅ پاسخ موفق
    return Response.json(
      {
        success: true,
        data: newBlog,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("خطا در ساخت بلاگ:", error);

    // ❌ پاسخ خطا
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}