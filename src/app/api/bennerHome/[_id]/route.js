// src/app/api/bennerHome/[id]/route.js

import { NextResponse } from 'next/server'
import connectDB from '/utils/ConnectDB'
import BennerHomes from '/models/BennerHomes'

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
    const deletedBenner = await BennerHomes.findByIdAndDelete(_id)

    // اگر چیزی پیدا نشد
    if (!deletedBenner) {
      return NextResponse.json(
        { success: false, message: 'بنری با این ID پیدا نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'بنر با موفقیت حذف شد',
      data: deletedBenner,
    })
  } catch (error) {
    console.error('خطا در حذف بنر:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'خطا در حذف بنر',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
