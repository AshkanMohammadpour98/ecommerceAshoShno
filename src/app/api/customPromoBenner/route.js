// src/app/api/customPromoBenner/route.js
import { NextResponse } from 'next/server';
import CustomPromoBenners from '/models/CustomPromoBenners';
import connectDB from '/utils/ConnectDB'

// GET - دریافت همه بلاگ‌ها
export async function GET(request) {
  try {
      let benners = []

    await connectDB()
    benners = await CustomPromoBenners.find()


    return NextResponse.json({
      success: true,
      count: benners.length,
      data: benners,
    })

  } catch (error) {
    console.error('خطا در دریافت اطلاعات بنرهای تبلیغ مشتری:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'خطا در اتصال به دیتابیس'
      },
      { status: 500 }
    )
  }
}

// POST - ساخت بنز تبلیغ مشتری جدید
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()

    try {
      const newCustomPromoBenner = await CustomPromoBenners.create(body)

      return Response.json(
        {
          success: true,
          data: newCustomPromoBenner
        },
        { status: 201 }
      )
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: error.message
        },
        { status: 422 }
      )
    }

  } catch (error) {
    console.error('خطا در ساخت بنرهای تبلیغ مشتری:', error)

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}