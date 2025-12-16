import Tags from '/models/Tags'
import connectDB from '/utils/ConnectDB'
// import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    let tag = []

    await connectDB()
    tag = await Tags.find()


    return Response.json({
      success: true,
      count: tag.length,
      data: tag
    })

  } catch (error) {
    console.error('خطا در دریافت تگ ها', error)
    return Response.json(
      { success: false, error: 'خطا در اتصال به دیتابیس' },
      { status: 500 }
    )
  }
}


// post methods
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();


    // ======= اعتبارسنجی فیلد نام تگ =======
    if (!body.name) {
      return Response.json(
        { error: "فیلد نام تگ الزامی است" },
        { status: 422 }
      );
    }


    // ======= مقادیر پیش‌فرض =======
    const payload = {
      id: body.id || Date.now().toString(),
      name: body.name.trim(),
    };

    try {
      const newTag = await Users.create(payload);

      return Response.json(
        {
          success: true,
          data: newTag
        },
        { status: 201 }
      );
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: error.message
        },
        { status: 422 }
      );
    }

  } catch (error) {
    console.error(" خطای سمت سرور خطا در افزودن تگ:", error);

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}


// هندل کردن متدهای غیرمجاز
export function PUT() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
export function DELETE() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
export function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}