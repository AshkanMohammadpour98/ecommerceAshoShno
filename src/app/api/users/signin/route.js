// /api/users/signin
import Users from '/models/Users'
import connectDB from '/utils/ConnectDB'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import {serialize} from "cookie"
import { NextResponse } from 'next/server';


// ورود به یوزر بامتد POST
export async function POST(request) {
  try {
    // اتصال به دیتابیس
    // همیشه اولین کار اتصال به MongoDB است
    await connectDB();

    // گرفتن اطلاعات ارسال‌شده از سمت کلاینت
    const body = await request.json();
    const { email, password, phone } = body;

    // ============================
    // ۱) اعتبارسنجی داده‌ها
    // ============================

    // چک می‌کنیم که پسورد وارد شده باشد
    if (!password || password.trim() === "") {
      return Response.json({ error: "رمز عبور الزامی است" }, { status: 422 });
    }

    // چک می‌کنیم حداقل یک روش ورود (ایمیل یا تلفن) وارد شده باشد
    if ((!email || email.trim() === "") && (!phone || phone.trim() === "")) {
      return Response.json(
        { error: "ایمیل یا شماره باید وارد شود" },
        { status: 422 }
      );
    }

    // پسورد باید طول مشخصی داشته باشد
    if (password.length < 6 || password.length > 20) {
      return Response.json(
        { error: "طول پسورد باید بین 6 تا 20 کاراکتر باشد" },
        { status: 422 }
      );
    }

    // ============================
    // ۲) پیدا کردن کاربر بر اساس ایمیل
    // ============================

    const isUserExist = await Users.findOne({ email });

    // اگر ایمیل اشتباه باشد یا کاربر وجود نداشته باشد
    if (!isUserExist) {
      return Response.json(
        { error: "ایمیل یا رمز اشتباه است" },
        { status: 401 }
      );
    }

    // ============================
    // ۳) مقایسه پسورد وارد شده با پسورد هش‌شده در دیتابیس
    // ============================

    const isValidPassword = await bcrypt.compare(
      password,
      isUserExist.password
    );

    // اگر پسورد مطابقت نداشته باشد
    if (!isValidPassword) {
      return Response.json(
        { error: "رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // ============================
    // ۴) ساخت JWT Token
    // ============================
    // هیچ‌وقت role و phone را از کلاینت نگیریم
    // همیشه از دیتابیس بخوانیم چون ورودی کلاینت قابل اعتماد نیست
    const token = jwt.sign(
      {
        email: isUserExist.email,
        role: isUserExist.role,
        phone: isUserExist.phone,
        id: isUserExist._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // اعتبار توکن ۲ ساعت
    );

    // ============================
    // ۵) ساخت Response و ذخیره توکن در کوکی
    // ============================
    // نکته مهم: باید NextResponse.json بسازیم تا بتوانیم header اضافه کنیم
    const response = NextResponse.json(
      { message: "ورود موفق", token },
      { status: 200 }
    );

    // ست کردن کوکی روی هدر
    response.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true, // از سمت جاوااسکریپت قابل خواندن نیست → امنیت بالاتر
        path: "/",       // روی کل سایت اعمال می‌شود
        maxAge: 60 * 60 * 2, // اعتبار ۲ ساعت
        // sameSite: "strict",   // جلوگیری از CSRF
        // secure: true,   // فقط روی HTTPS فعال می‌شود
         sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
                       // اگر روی localhost تست می‌کنی باید false کنی
      })
    );

    // مهم‌ترین نکته:
    // باید دقیقا همین `response` را return کنیم چون کوکی روی این تعریف شده
    return response;

  } catch (error) {
    // گرفتن خطاهای غیرمنتظره
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}


// هندل کردن متدهای غیرمجاز
export async function GET() {
  return Response.json({ error: "Method Not Allowed", status: 405 });

}
export function PUT() {
  return Response.json({ error: "Method Not Allowed", status: 405 });
}
export function DELETE() {
  return Response.json({ error: "Method Not Allowed" ,status: 405 });
}
export function PATCH() {
  return Response.json({ error: "Method Not Allowed" , status: 405 });
}