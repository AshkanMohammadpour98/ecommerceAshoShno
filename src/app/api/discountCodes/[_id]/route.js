import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "/utils/ConnectDB";
import DiscountCodes from "/models/DiscountCodes";

/**
 * ===============================
 * GET /api/discountCodes/:_id
 * دریافت یک کد تخفیف
 * ===============================
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { _id } = params;

    const code = await DiscountCodes.findById(_id);

    if (!code) {
      return NextResponse.json(
        { success: false, message: "کد تخفیف پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: code,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت کد تخفیف" },
      { status: 500 }
    );
  }
}

/**
 * ===============================
 * PATCH /api/discountCodes/:_id
 * ویرایش کد تخفیف
 * ===============================
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { _id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    const updated = await DiscountCodes.findByIdAndUpdate(
      _id,
      {
        $set: {
          money: body.money,
          discountCode: body.discountCode,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

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
 * ===============================
 * DELETE /api/discountCodes/:_id
 * حذف کد تخفیف
 * ===============================
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { _id } = params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

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
