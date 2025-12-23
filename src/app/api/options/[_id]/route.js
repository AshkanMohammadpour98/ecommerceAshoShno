import Options from "/models/Options";
import connectDB from "/utils/ConnectDB";

/* =======================
   GET : دریافت یک option با id
======================= */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const option = await Options.findOne({ _id: params._id });

    // اگر پیدا نشد
    if (!option) {
      return Response.json(
        { success: false, message: "اپشن پیدا نشد" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error("خطا در دریافت اپشن:", error);
    return Response.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}

/* =======================
   PUT : ویرایش option
======================= */
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    // اعتبارسنجی
    if (!body.label || !body.value) {
      return Response.json(
        { error: "لیبل و مقدار الزامی هستند" },
        { status: 422 }
      );
    }

const updatedOption = await Options.findByIdAndUpdate(
  params._id, // مستقیماً _id
  {
    label: body.label.trim(),
    value: body.value.trim(),
  },
  { new: true } // برگرداندن دیتای جدید
);


    if (!updatedOption) {
      return Response.json(
        { success: false, message: "اپشن پیدا نشد" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: updatedOption,
    });
  } catch (error) {
    console.error("خطا در ویرایش اپشن:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE : حذف option
======================= */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

const deletedOption = await Options.findByIdAndDelete(params._id);

    if (!deletedOption) {
      return Response.json(
        { success: false, message: "اپشن پیدا نشد" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "اپشن با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("خطا در حذف اپشن:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   متدهای غیرمجاز
======================= */
export function POST() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
export function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
