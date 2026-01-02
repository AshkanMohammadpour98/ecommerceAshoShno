import { isValidObjectId } from "mongoose";
import connectDB from '/utils/ConnectDB'
import { NextResponse } from 'next/server';
import Categorys from '/models/Categorys';




// GET /api/categorys/[_id] ( و name گرفتن یک یوزر با ID)
// GET /api/categorys/[_id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    let category = null;

    // 🔹 اگر ObjectId معتبر بود → جستجو با ID
    if (isValidObjectId(_id)) {
      category = await Categorys.findById(_id);
    }

    // 🔹 اگر ObjectId نبود یا چیزی پیدا نشد → جستجو با name
    if (!category) {
      category = await Categorys.findOne({
        name: { $regex: `^${_id}$`, $options: "i" } // insensitive
      });
    }

    if (!category) {
      return NextResponse.json(
        { message: "category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });

  } catch (error) {
    console.error(`Error fetching category ${params._id}:`, error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


// DELETE /api/category/[_id] (حذف یک محصول با ID)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }
    
    const deletedUser = await Categorys.findByIdAndDelete(_id);
    
    if (!deletedUser) {
      return NextResponse.json({ message: 'category not found to delete' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'category deleted successfully', data: deletedUser }, {status: 200});
  } catch (error) {
    console.error(`Error deleting category ${params._id}:`, error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/categorys/[_id] (آپدیت یک دسته بندی با ID)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;
    const body = await request.json();

    if (!isValidObjectId(_id)) {
      return NextResponse.json({ message: "Invalid category ID format" }, { status: 400 });
    }

    const updatedUser = await Categorys.findByIdAndUpdate(
      _id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "category not found to update" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(`Error updating category ${params._id}:`, error);
    return NextResponse.json({ message: "Server error or invalid data" }, { status: 500 });
  }
}

// PATCH /api/categorys/[_id]
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { _id } = params;
    const body = await request.json();

    if (!isValidObjectId(_id)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const updatedCategory = await Categorys.findByIdAndUpdate(
      _id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { message: "category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export function POST() {
  return Response.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}



