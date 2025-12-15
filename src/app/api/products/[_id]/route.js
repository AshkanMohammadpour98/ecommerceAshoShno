import { NextResponse } from "next/server";
import connectDB from "/utils/connectDB";
import Product from "/models/Products";

/* =========================
   GET → دریافت یک محصول
   بر اساس id فرانت
========================= */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { _id } = params;
    console.log(_id);
  
    

    const product = await Product.findOne({ _id });
    console.log(product);
    

    if (!product) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH → ویرایش محصول
   (ویرایش جزئی)
========================= */
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { _id } = params;
    const body = await req.json();

    const updatedProduct = await Product.findOneAndUpdate(
      { _id },
      {
        ...body,
        price: body.price && Number(body.price),
        discountedPrice:
          body.discountedPrice && Number(body.discountedPrice),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → حذف محصول
========================= */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { _id } = params;

    const deleted = await Product.findOneAndDelete({ _id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "محصول حذف شد" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
