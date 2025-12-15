// ❗ Server Component
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import React from "react";

import connectDB from "/utils/ConnectDB";
import Users from "/models/Users";

export default async function AuthGuard({ children }) {
  // 🟦 اتصال به دیتابیس
  await connectDB();

  // 🟦 گرفتن توکن
  const token = cookies().get("token")?.value;
  if (!token) redirect("/signin");

  let decoded = null;

  try {
    // 🟩 decode JWT
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    redirect("/signin");
  }

  // 🟦 گرفتن email و phone حتی اگر خالی باشند
  const email = decoded?.email ?? "";
  const phone = decoded?.phone ?? "";

  let user = null;

  // 🟥 اگر فقط email پر بود
  if (email && !phone) {
    user = await Users.findOne({ email }).lean();
  }

  // 🟥 اگر فقط phone پر بود
  else if (phone && !email) {
    user = await Users.findOne({ phone }).lean();
  }

  // 🟥 اگر هردو پر بودند (ترجیح با email، اگر خواستی تغییر می‌دم)
  else if (email && phone) {
    user = await Users.findOne({ email }).lean();
    if (!user) {
      user = await Users.findOne({ phone }).lean();
    }
  }

  // 🟥 اگر هیچ‌کدام پر نبودند → user را null نگذار، از token بساز!
  if (!email && !phone) {
    user = decoded; // یا یک object بساز
  }

  // 🟥 اگر کاربر پیدا نشد → ریدایرکت
  if (!user) redirect("/signin");

  /**
   * 🟨 تزریق user به children
   */
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}
