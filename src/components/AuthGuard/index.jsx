import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import React from "react";

import connectDB from "/utils/ConnectDB"; // استفاده از Alias استاندارد
import Users from "/models/Users";
import { UserProvider } from "@/app/context/UserContext"; // اصلاح مسیر به ریشه

export default async function AuthGuard({ children }) {
  await connectDB();

  const token = cookies().get("token")?.value;
  if (!token) redirect("/signin");

  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    redirect("/signin");
  }

  const email = decoded?.email ?? "";
  const phone = decoded?.phone ?? "";
  let user = null;

  // منطق جستجوی کاربر
  if (email && !phone) {
    user = await Users.findOne({ email }).lean();
  } else if (phone && !email) {
    user = await Users.findOne({ phone }).lean();
  } else if (email && phone) {
    user = await Users.findOne({ email }).lean();
    if (!user) {
      user = await Users.findOne({ phone }).lean();
    }
  }

  if (!user && (email || phone)) {
    user = decoded;
  }

  if (!user) redirect("/signin");

  // سریالیزه کردن برای عبور از سرور به کلاینت
  if (user._id) user._id = user._id.toString();
  const serializableUser = JSON.parse(JSON.stringify(user));

  return (
    <UserProvider user={serializableUser}>
      {children}
    </UserProvider>
  );
}