// app/api/users/check/route.js
import Users from '/models/Users'
import connectDB from '/utils/ConnectDB'
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { exists: false, error: "ایمیل یا شماره ارسال نشده است." },
        { status: 400 }
      );
    }

    let user = null;

    if (email) {
      user = await Users.findOne({ email });
    } else if (phone) {
      user = await Users.findOne({ phone });
    }

    return NextResponse.json({ exists: !!user });

  } catch (err) {
    return NextResponse.json(
      { error: "خطا در بررسی وجود کاربر" },
      { status: 500 }
    );
  }
}
