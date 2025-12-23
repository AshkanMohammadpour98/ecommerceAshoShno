import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB"; // آدرس فایل اتصال دیتابیس
import LimitedDiscountCountdown from "/models/LimitedDiscountCountdown"; // آدرس مدل  

// ==========================================
// متد GET: دریافت لیست تخفیف‌های فعال
// ==========================================
export async function GET() {
  try {
    // 1. اتصال به دیتابیس
    await connectDB();

    // 2. دریافت تمام تخفیف‌ها (جدیدترین‌ها اول)
    const discounts = await LimitedDiscountCountdown.find({}).sort({
      createdAt: -1,
    });

    // نکته: در اینجا ما فقط آیدی محصول (productId) را داریم.
    // در فرانت‌اند باید با استفاده از این آیدی، اطلاعات کامل محصول را از /api/products فچ کنید
    // یا می‌توانید همین‌جا یک درخواست داخلی بزنید (که روش اول معمول‌تر است).

    return NextResponse.json({ success: true, data: discounts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات", error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// متد POST: ایجاد یک تخفیف جدید
// ==========================================
export async function POST(req) {
  try {
    await connectDB();

    // دریافت داده‌ها از بدنه درخواست
    const body = await req.json();
    const { productId, startedAt, endsAt, description } = body;

    // اعتبارسنجی ساده
    if (!productId || !startedAt || !endsAt) {
      return NextResponse.json(
        { success: false, message: "لطفا تمام فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    // ایجاد داکیومنت جدید در دیتابیس
    const newDiscount = await LimitedDiscountCountdown.create({
      productId,
      startedAt,
      endsAt,
      description,
    });

    return NextResponse.json(
      { success: true, message: "تخفیف با موفقیت ایجاد شد", data: newDiscount },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در ثبت تخفیف", error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// متد DELETE: حذف تخفیف
// ==========================================
export async function DELETE(req) {
  try {
    await connectDB();

    // دریافت آیدی تخفیف از کوئری پارامتر (مثلا ?id=...)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "آیدی مورد نیاز است" },
        { status: 400 }
      );
    }

    // حذف از دیتابیس
    const deletedDiscount = await LimitedDiscountCountdown.findByIdAndDelete(id);

    if (!deletedDiscount) {
      return NextResponse.json(
        { success: false, message: "تخفیفی با این آیدی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "تخفیف حذف شد" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در حذف", error: error.message },
      { status: 500 }
    );
  }
}