import { NextResponse } from "next/server";
import connectDB from "/utils/ConnectDB";

import Contacts from "/models/Contacts";

// دریافت اطلاعات تماس
export async function GET() {
  try {
    await connectDB();
    const contact = await Contacts.findOne().sort({ createdAt: -1 });
    return NextResponse.json(contact || {}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "خطا در دریافت داده‌ها" }, { status: 500 });
  }
}

// بروزرسانی اطلاعات تماس
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    // پیدا کردن اولین رکورد یا ایجاد رکورد جدید در صورت نبودن
    const updatedContact = await Contacts.findOneAndUpdate(
      {}, 
      { $set: body }, 
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "خطا در بروزرسانی" }, 
      { status: 400 }
    );
  }
}