// src/app/api/chaildBennerHome/[id]/route.js

import { NextResponse } from 'next/server'
import connectDB from '/utils/ConnectDB'
import CustomPromoBenners from '/models/CustomPromoBenners';

// DELETE - حذف بنر با id
export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { _id } = params

    // بررسی وجود id
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'ID ارسال نشده است' },
        { status: 400 }
      )
    }

    // حذف بنر
    const deletedBenner = await CustomPromoBenners.findByIdAndDelete(_id)

    // اگر چیزی پیدا نشد
    if (!deletedBenner) {
      return NextResponse.json(
        { success: false, message: 'بنر کوچک اصلی با این ID پیدا نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'بنر کوچک اصلی با موفقیت حذف شد',
      data: deletedBenner,
    })
  } catch (error) {
    console.error('خطا در حذف بنر کوچک اصلی:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'خطا در حذف بنر کوچک اصلی',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
