import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB";
import DiscountCodes from "/models/DiscountCodes";

/**
 * ===============================
 * GET /api/discountCodes
 * دریافت همه کدهای تخفیف
 * ===============================
 */
export async function GET() {
  try {
    await connectDB();

    const codes = await DiscountCodes.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت کدهای تخفیف",
      },
      { status: 500 }
    );
  }
}

/**
 * ===============================
 * POST /api/discountCodes
 * ثبت کد تخفیف جدید
 * ===============================
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { money, discountCode, id } = body;

    // 🟡 اعتبارسنجی اولیه
    if (!money || !discountCode) {
      return NextResponse.json(
        {
          success: false,
          message: "money و discountCode الزامی هستند",
        },
        { status: 422 }
      );
    }

    const newCode = await DiscountCodes.create({
      id,
      money,
      discountCode,
    });

    return NextResponse.json(
      {
        success: true,
        data: newCode,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "خطا در ثبت کد تخفیف",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
