// src/app/api/chaildBennerHome/route.js
import { NextResponse } from 'next/server';
import ChaildBennerHomes from '/models/chaildBennerHomes';
import connectDB from '/utils/ConnectDB'

// GET - دریافت همه بلاگ‌ها
export async function GET(request) {
  try {


      let benners = []

    await connectDB()
    benners = await ChaildBennerHomes.find()


    return NextResponse.json({
      success: true,
      count: benners.length,
      data: benners,
    })

  } catch (error) {
    console.error('خطا در دریافت اطلاعات بنر اصلی کوچک دوتایی:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'خطا در اتصال به دیتابیس'
      },
      { status: 500 }
    )
  }
}

// POST - ساخت بلاگ جدید
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()



    try {
      const newBennerHome = await ChaildBennerHomes.create(body)

      return Response.json(
        {
          success: true,
          data: newBennerHome
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
    console.error('خطا در ساخت بنر اصلی کوچک دوتایی:', error)

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}