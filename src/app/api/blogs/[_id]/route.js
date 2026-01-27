// src/app/api/blogs/[_id]
import Blog from '/models/Blogs'
import mongoose, { isValidObjectId } from "mongoose";
import connectDB from '/utils/ConnectDB'
import { NextResponse } from 'next/server';
import fs from "fs/promises"; // برای حذف فیزیکی فایل بصورت فیزیکی از این ماژول اف اس استفاده میکنم
import path from "path";


// تابع کمکی برای حذف فایل (برای جلوگیری از تکرار کد)
async function deletePhysicalFile(relativeUrl) {
  if (relativeUrl && relativeUrl.startsWith("/uploads/blogs/")) {
    const filePath = path.join(process.cwd(), "public", relativeUrl);
    try {
      await fs.unlink(filePath);
      // console.log("فایل با موفقیت حذف شد:", relativeUrl);
    } catch (err) {
      console.error("خطا در حذف فایل یا فایل وجود ندارد:", relativeUrl);
    }
  }
}


// GET /api/blogs/[id] (گرفتن یک بلاگ با ID)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { _id } =  await params;

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await Blog.findById(_id);
    if (!blog) {
      return NextResponse.json({ message: "blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error(`Error fetching blog ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/blogs/[_id] (آپدیت یک بلاگ با ID)
//  ویرایش بلاگ (PUT)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { _id } = await params;
    
    if (!isValidObjectId(_id)) return NextResponse.json({ message: "ID نامعتبر" }, { status: 400 });

    const formData = await request.formData();
    const imgFile = formData.get("img"); // ممکن است فایل جدید باشد یا رشته قدیمی

    const existingBlog = await Blog.findById(_id);
    if (!existingBlog) return NextResponse.json({ message: "بلاگ یافت نشد" }, { status: 404 });

    let finalImageUrl = existingBlog.img;

    // بررسی آپلود عکس جدید
    if (imgFile && typeof imgFile !== "string") {
      // الف) حذف عکس قدیمی از مسیر /public/uploads/blogs
      await deletePhysicalFile(existingBlog.img);

      // ب) ذخیره عکس جدید در همان مسیر
      const buffer = Buffer.from(await imgFile.arrayBuffer());
      const fileName = `${Date.now()}_${imgFile.name.replace(/\s/g, "_")}`;
      const relativePath = `/uploads/blogs/${fileName}`; // مسیر دقیق شما
      const fullPath = path.join(process.cwd(), "public", relativePath);

      await fs.writeFile(fullPath, buffer);
      finalImageUrl = relativePath;
    }

    // آپدیت دیتابیس
    const updateData = Object.fromEntries(formData.entries());
    updateData.img = finalImageUrl; // جایگزین کردن مسیر عکس نهایی

    const updatedBlog = await Blog.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(updatedBlog, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "خطا در ویرایش" }, { status: 500 });
  }
}

// DELETE /api/products/[id] (حذف یک بلاگ با ID)
//  حذف بلاگ (DELETE)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { _id } = await params;

    const blogToDelete = await Blog.findById(_id);
    if (!blogToDelete) return NextResponse.json({ message: "یافت نشد" }, { status: 404 });

    // حذف فیزیکی عکس از پوشه blogs
    await deletePhysicalFile(blogToDelete.img);

    // حذف از دیتابیس
    await Blog.findByIdAndDelete(_id);

    return NextResponse.json({ message: "بلاگ و عکس حذف شدند" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "خطا در حذف" }, { status: 500 });
  }
}