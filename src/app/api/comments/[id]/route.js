import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "/utils/ConnectDB";
import Comments from "/models/Comments";

/**
 * ===============================
 * PATCH /api/comments/:id
 * ویرایش نظر
 * ===============================
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // 🟡 بررسی معتبر بودن ObjectId
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updatedComment = await Comments.findByIdAndUpdate(
      id,
      {
        $set: {
          review: body.review,
          authorName: body.authorName,
          authorImg: body.authorImg,
          authorRole: body.authorRole,
        },
      },
      {
        new: true,        // 🟢 نسخه جدید را برگردان
        runValidators: true, // 🟢 اعتبارسنجی schema
      }
    );

    if (!updatedComment) {
      return NextResponse.json(
        { success: false, message: "نظر پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("خطا در ویرایش نظر:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در ویرایش نظر",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
/**
 * ===============================
 * DELETE /api/comments/:id
 * حذف نظر
 * ===============================
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // 🟡 بررسی معتبر بودن ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID نامعتبر است" },
        { status: 400 }
      );
    }

    const deletedComment = await Comments.findByIdAndDelete(id);

    if (!deletedComment) {
      return NextResponse.json(
        { success: false, message: "نظر پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "نظر با موفقیت حذف شد",
      data: deletedComment,
    });
  } catch (error) {
    console.error("خطا در حذف نظر:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در حذف نظر",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

