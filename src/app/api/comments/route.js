import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB";
import Comments from "/models/Comments";

/**
 * ===============================
 * GET /api/comments
 * دریافت لیست نظرات کاربران
 * ===============================
 */
export async function GET() {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // دریافت همه نظرات (جدیدترین اول)
    const comments = await Comments.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error("خطا در دریافت نظرات:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت نظرات",
      },
      { status: 500 }
    );
  }
}
/**
 * ===============================
 * POST /api/comments
 * ثبت نظر جدید
 * ===============================
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // 🟡 اعتبارسنجی ساده
    if (!body.review || !body.authorName || !body.authorRole) {
      return NextResponse.json(
        {
          success: false,
          message: "اطلاعات اجباری ناقص است",
        },
        { status: 422 }
      );
    }

    // 🟢 ساخت نظر
    const newComment = await Comments.create({
      review: body.review,
      authorName: body.authorName,
      authorImg: body.authorImg || "/images/users/default-user.png",
      authorRole: body.authorRole,
      id: body.id, // اختیاری
    });

    return NextResponse.json(
      {
        success: true,
        data: newComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("خطا در ثبت نظر:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در ثبت نظر",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
