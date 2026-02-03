import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "/utils/ConnectDB";
import DiscountCodes from "/models/DiscountCodes";

/**
 * ==================================================
 * GET /api/discountCodes/:_id
 * دریافت یک کد تخفیف با _id مونگوس
 * ==================================================
 */
export async function GET(request, { params }) {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // 🔴 در App Router جدید params async است
    const { _id } = await params;

    // بررسی معتبر بودن ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    // دریافت کد تخفیف از دیتابیس
    const code = await DiscountCodes.findById(_id);

    // اگر پیدا نشد
    if (!code) {
      return NextResponse.json(
        { success: false, message: "کد تخفیف پیدا نشد" },
        { status: 404 }
      );
    }

    // پاسخ موفق
    return NextResponse.json({
      success: true,
      data: code,
    });
  } catch (error) {
    // مدیریت خطای کلی
    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت کد تخفیف",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ==================================================
 * PATCH /api/discountCodes/:_id
 * ویرایش اطلاعات یک کد تخفیف
 * ==================================================
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // گرفتن id و body
    const { _id } = await params;
    const body = await request.json();

    // اعتبارسنجی id
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    /**
     * بروزرسانی کد تخفیف
     * - new: true → مقدار جدید برگردد
     * - runValidators → ولیدیشن‌های مدل اجرا شوند
     */
    const updated = await DiscountCodes.findByIdAndUpdate(
      _id,
      {
        $set: {
          money: body.money,
          discountCode: body.discountCode,
          isActive: body.isActive,
          activeDate: body.activeDate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // اگر رکورد وجود نداشت
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "کد تخفیف پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "خطا در ویرایش کد تخفیف",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ==================================================
 * DELETE /api/discountCodes/:_id
 * حذف یک کد تخفیف
 * ==================================================
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { _id } = await params;

    // بررسی معتبر بودن id
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    // حذف از دیتابیس
    const deleted = await DiscountCodes.findByIdAndDelete(_id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "کد تخفیف پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "کد تخفیف با موفقیت حذف شد",
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "خطا در حذف کد تخفیف",
        error: error.message,
      },
      { status: 500 }
    );
  }
}