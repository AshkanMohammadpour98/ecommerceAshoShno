// src/app/api/products/route.js
import Blog from '/models/Blog'
import mongoose, { isValidObjectId } from "mongoose";
import connectDB from '/utils/ConnectDB'
import { NextResponse } from 'next/server';




// GET /api/products/[id] (گرفتن یک محصول با ID)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    const blog = await Blog.findById(_id);
    if (!blog) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/products/[id] (حذف یک محصول با ID)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }
    
    const deletedBlog = await Blog.findByIdAndDelete(_id);
    
    if (!deletedBlog) {
      return NextResponse.json({ message: 'Product not found to delete' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully', data: deletedBlog }, {status: 200});
  } catch (error) {
    console.error(`Error deleting product ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/products/[_id] (آپدیت یک محصول با ID)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;
    const body = await request.json();

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: "Invalid product ID format" }, { status: 400 });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      _id,
      body,
      { new: true, runValidators: true }
    )

    if (!updatedBlog) {
      return NextResponse.json({ message: "Product not found to update" }, { status: 404 });
    }

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    return NextResponse.json({ message: "Server error or invalid data" }, { status: 500 });
  }
}