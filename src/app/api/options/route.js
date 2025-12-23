import Options from '/models/Options'
import connectDB from '/utils/ConnectDB'
// import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    let option = []

    await connectDB()
    option = await Options.find()


    return Response.json({
      success: true,
      count: option.length,
      data: option
    })

  } catch (error) {
    console.error('خطا در دریافت اپشن ها', error)
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


    // ======= اعتبارسنجی فیلد لیبل =======
    if (!body.label ) {
      return Response.json(
        { error: "فیلد لیبل الزامی است" },
        { status: 422 }
      );
    }

    
    // ======= اعتبارسنجی فیلد مقدار =======
    if (!body.value ) {
      return Response.json(
        { error: "فیلد مقدار الزامی است" },
        { status: 422 }
      );
    }

    // ======= مقادیر پیش‌فرض =======
    const payload = {
      id: body.id || Date.now().toString(),
      label: body.label.trim(),
      value: body.value.trim(),
    };

    try {
      const newOption = await Options.create(payload);

      return Response.json(
        {
          success: true,
          data: newOption
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
    console.error(" خطای سمت سرور خطا در افزودن اپشن:", error);

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