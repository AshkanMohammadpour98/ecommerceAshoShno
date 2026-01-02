import connectDB from "/utils/ConnectDB";
import Gender from "/models/Gender";

/* =======================
   GET → گرفتن همه gender ها
   ======================= */
export async function GET() {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // گرفتن همه دیتاها
    const genders = await Gender.find().sort({ createdAt: -1 });

    return Response.json({
      success: true,
      count: genders.length,
      data: genders,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   POST → ساخت gender جدید
   ======================= */
export async function POST(req) {
  try {
    await connectDB();

    // گرفتن داده از body
    const body = await req.json();
    const { name, products } = body;

    // ساخت رکورد جدید
    const newGender = await Gender.create({
      name,
      products: products ?? 0,
      id: crypto.randomUUID().slice(0, 4),
    });

    return Response.json(
      { success: true, data: newGender },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* =======================
   PATCH → ویرایش gender
   ======================= */
export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, ...updateData } = body;

    // پیدا کردن و آپدیت
    const updatedGender = await Gender.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );

    if (!updatedGender) {
      return Response.json(
        { success: false, message: "Gender not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: updatedGender });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* =======================
   DELETE → حذف gender
   ======================= */
export async function DELETE(req) {
  try {
    await connectDB();

    // گرفتن id از query string
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const deletedGender = await Gender.findOneAndDelete({ id });

    if (!deletedGender) {
      return Response.json(
        { success: false, message: "Gender not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: deletedGender,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
