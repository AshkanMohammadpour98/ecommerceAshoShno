// src/app/api/chaildBennerHome/[_id]/route.js

import { NextResponse } from 'next/server'
import connectDB from '/utils/ConnectDB'
import CustomPromoBenners from '/models/CustomPromoBenners'

/* =====================================================
   GET - دریافت یک بنر با _id
===================================================== */
export async function GET(request, { params }) {
  try {
    await connectDB()

    const { _id } = await params

    // بررسی وجود _id
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'ID ارسال نشده است' },
        { status: 422 }
      )
    }

    const banner = await CustomPromoBenners.findById(_id)

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'بنر مورد نظر پیدا نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    )
  } catch (error) {
    console.error(`Error fetching banner ${params._id}:`, error)

    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    )
  }
}

/* =====================================================
   PATCH - ویرایش بنر با _id
===================================================== */
export async function PATCH(request, { params }) {
  
  
  try {
    await connectDB()

    const { _id } = await params
    const body = await request.json()

    // بررسی وجود _id
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'ID ارسال نشده است' },
        { status: 400 }
      )
    }

    // آپدیت بنر
    const updatedBanner = await CustomPromoBenners.findByIdAndUpdate(
      _id,
      body,
      {
        new: true,          // داده آپدیت‌شده برگردانده شود
        runValidators: true // اعتبارسنجی اسکیما اجرا شود
      }
    )

    // اگر بنری پیدا نشد
    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, message: 'بنر مورد نظر پیدا نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'بنر با موفقیت ویرایش شد',
      data: updatedBanner,
    })
  } catch (error) {
    console.error('خطا در ویرایش بنر:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ویرایش بنر',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/* =====================================================
   DELETE - حذف بنر با _id
===================================================== */
export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { _id } = await params

    // بررسی وجود id
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'ID ارسال نشده است' },
        { status: 400 }
      )
    }

    // حذف بنر
    const deletedBanner = await CustomPromoBenners.findByIdAndDelete(_id)

    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, message: 'بنر مورد نظر پیدا نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'بنر با موفقیت حذف شد',
      data: deletedBanner,
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
