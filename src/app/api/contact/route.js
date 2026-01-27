// api/contact/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectDB from "/utils/ConnectDB";
import Contacts from "/models/Contacts";

// مسیر ذخیره لوگو
const logoPath = path.join(process.cwd(), "public/images/logo");
if (!fs.existsSync(logoPath)) fs.mkdirSync(logoPath, { recursive: true });

export async function GET() {
  try {
    await connectDB();
    const contact = await Contacts.findOne().sort({ createdAt: -1 });
    return NextResponse.json(contact || {}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "خطا در دریافت داده‌ها" }, { status: 500 });
  }
}

// ذخیره و آپلود لوگو (Base64)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // اگر لوگو به صورت Base64 ارسال شده، ذخیره فیزیکی کنیم
    if (body.logoBase64) {
      const base64Data = body.logoBase64.replace(/^data:image\/\w+;base64,/, "");
      const filePath = path.join(logoPath, "logo.png");
      fs.writeFileSync(filePath, base64Data, "base64");
      body.logo = "/images/logo/logo.png"; // مسیر ذخیره در MongoDB
      delete body.logoBase64;
    }

    // بروزرسانی یا ایجاد رکورد
    const contact = await Contacts.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, contact }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message || "خطا در بروزرسانی" }, { status: 500 });
  }
}

// حذف لوگو فیزیکی و MongoDB
export async function DELETE() {
  try {
    await connectDB();
    const contact = await Contacts.findOne();
    if (!contact || !contact.logo) return NextResponse.json({ message: "لوگو موجود نیست" }, { status: 404 });

    // حذف فایل فیزیکی
    const filePath = path.join(process.cwd(), "public", contact.logo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // حذف مسیر لوگو در MongoDB
    contact.logo = "";
    await contact.save();

    return NextResponse.json({ success: true, message: "لوگو حذف شد" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
