import { NextResponse } from "next/server";

export function middleware(request) {
  // گرفتن توکن از کوکی
  const token = request.cookies.get("token")?.value;

  // اگر کاربر قصد ورود به پنل را دارد و توکن ندارد
  if (request.nextUrl.pathname.startsWith("/panel") && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// فقط روی مسیرهای پنل اعمال شود
export const config = {
  matcher: ["/panel/:path*"],
};