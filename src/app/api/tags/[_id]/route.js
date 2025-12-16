// src/app/api/tag/[_id]route.js
import Tags from '/models/Tags'
import { isValidObjectId } from "mongoose";
import connectDB from '/utils/ConnectDB'
import { NextResponse } from 'next/server';




// GET /api/tags/[_id] (گرفتن یک تگ با ID)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    if (!isValidObjectId(_id )) {
      return NextResponse.json({ message: "TagID not found " }, { status: 422 });
    }

    const users = await Tags.findById(_id);
    if (!users) {
      return NextResponse.json({ message: "tag ID found" }, { status: 404 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error(`Error fetching user ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/users/[_id] (حذف یک محصول با ID)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    const deletedUser = await Tags.findByIdAndDelete(_id);
    
    if (!deletedUser) {
      return NextResponse.json({ message: 'user not found to delete' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'user deleted successfully', data: deletedUser }, {status: 200});
  } catch (error) {
    console.error(`Error deleting user ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/users/[_id] (آپدیت یک یوزر با ID)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;
    const body = await request.json();

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }

    const updatedTag = await Tags.findByIdAndUpdate(
      _id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTag) {
      return NextResponse.json({ message: "user not found to update" }, { status: 404 });
    }

    return NextResponse.json(updatedTag, { status: 200 });
  } catch (error) {
    console.error(`Error updating user ${params._id}:`, error);
    return NextResponse.json({ message: "Server error or invalid data" }, { status: 500 });
  }
}


export function POST() {
  return Response.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

export function PATCH() {
  return Response.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}
