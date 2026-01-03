// /api/auth/me/route.js
import { cookies } from "next/headers";import jwt from "jsonwebtoken";
import connectDB from "/utils/ConnectDB";
import Users from "/models/Users";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "توکن یافت نشد" }, { status: 401 });
    }

    // ۱. رمزگشایی توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ۲. جستجو بر اساس ID (چون در لاگ شما id وجود دارد)
    // اگر در مدل شما فیلد آیدی _id است، از decoded.id استفاده میکنیم
    const user = await Users.findById(decoded.id || decoded._id).lean();

    if (!user) {
      return NextResponse.json({ message: "کاربر در دیتابیس یافت نشد" }, { status: 404 });
    }

    // ۳. چک کردن دقیق Role (حروف کوچک و بزرگ را با toLowerCase خنثی میکنیم)
    const userRole = String(user.role).toLowerCase();
    
    if (userRole !== "admin") {
      console.log("Access Denied for role:", user.role); // برای عیب‌یابی در ترمینال
      return NextResponse.json({ 
        message: "دسترسی غیرمجاز: شما ادمین نیستید", 
        role: user.role 
      }, { status: 403 });
    }

    // ۴. ارسال موفقیت‌آمیز دیتا
    const { password, ...userWithoutPassword } = user;
    if (userWithoutPassword._id) userWithoutPassword._id = userWithoutPassword._id.toString();

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

  } catch (err) {
    console.error("Auth API Error:", err.message);
    return NextResponse.json({ message: "خطای سرور یا توکن منقضی شده" }, { status: 401 });
  }
}