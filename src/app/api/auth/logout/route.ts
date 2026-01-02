import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // حذف کوکی توکن از سمت سرور
    cookieStore.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // انقضای فوری
      path: "/",
    });

    return NextResponse.json({ message: "با موفقیت خارج شدید" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "خطا در خروج" }, { status: 500 });
  }
}