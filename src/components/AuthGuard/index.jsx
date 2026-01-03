import { cookies } from "next/headers"; 
// ↑ برای دسترسی به کوکی‌ها در Server Component (App Router)

import { redirect } from "next/navigation"; 
// ↑ برای ریدایرکت امن سمت سرور (نه client-side)

import jwt from "jsonwebtoken"; 
// ↑ برای اعتبارسنجی و decode کردن JWT

import connectDB from "/utils/ConnectDB"; 
// ↑ اتصال به دیتابیس (MongoDB)

import Users from "/models/Users"; 
// ↑ مدل کاربر برای گرفتن اطلاعات از دیتابیس

import { UserProvider } from "@/app/context/UserContext"; 
// ↑ Context برای ارسال اطلاعات کاربر به کامپوننت‌های Client

// ------------------------------------------------------

export default async function AuthGuard({ children }) {
  /**
   * 1️⃣ اتصال به دیتابیس
   * چون این کامپوننت Server Component است،
   * می‌توانیم مستقیماً به دیتابیس وصل شویم
   */
  await connectDB();

  /**
   * 2️⃣ دریافت کوکی‌ها به روش صحیح در Next.js 16
   * cookies() در نسخه‌های جدید async شده
   */
  const cookieStore = await cookies();

  /**
   * 3️⃣ استخراج توکن JWT از کوکی
   * اگر کاربر لاگین نباشد، مقدار token = undefined خواهد بود
   */
  const token = cookieStore.get("token")?.value;

  console.log("SERVER TOKEN:", token);

  /**
   * 4️⃣ اگر توکن وجود نداشت → کاربر لاگین نیست
   * ریدایرکت امن به صفحه ورود
   */
  if (!token) redirect("/signin");

  /**
   * 5️⃣ اعتبارسنجی توکن JWT
   * اگر دستکاری شده باشد یا منقضی شده باشد → خطا
   */
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // توکن نامعتبر → خروج از حساب
    redirect("/signin");
  }

  /**
   * 6️⃣ استخراج اطلاعات کاربر از توکن
   * (ممکن است ایمیل یا شماره موبایل باشد)
   */
  const { email = "", phone = "" } = decoded || {};
  let user = null;

  /**
   * 7️⃣ تلاش برای پیدا کردن کاربر در دیتابیس
   * اول با ایمیل، اگر نبود با شماره موبایل
   */
  if (email) {
    user = await Users.findOne({ email }).lean();
  }

  if (!user && phone) {
    user = await Users.findOne({ phone }).lean();
  }

  /**
   * 8️⃣ اگر کاربر در دیتابیس نبود
   * (مثلاً حذف شده یا ساختار تغییر کرده)
   * از اطلاعات داخل توکن استفاده می‌کنیم
   */
  if (!user) {
    user = decoded;
  }

  /**
   * 9️⃣ اگر باز هم کاربر نداشتیم → خروج
   */
  if (!user) redirect("/signin");

  /**
   * 🔟 آماده‌سازی اطلاعات برای ارسال به Client
   * چون ObjectId قابل serialize نیست
   */
  if (user._id) {
    user._id = user._id.toString();
  }

  /**
   * 1️⃣1️⃣ ارسال اطلاعات کاربر به Context
   * تا در Client Components قابل استفاده باشد
   */
  return (
    <UserProvider user={JSON.parse(JSON.stringify(user))}>
      {children}
    </UserProvider>
  );
}
