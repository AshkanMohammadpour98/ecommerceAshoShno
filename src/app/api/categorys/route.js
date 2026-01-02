// /api/categorys/

import Categorys from '/models/Categorys'
import connectDB from '/utils/ConnectDB'

// GET - دریافت همه دسته بندی ها
// GET - دریافت همه دسته بندی ها یا جستجو بر اساس اسم دسته بندی اعمال شود
export async function GET(request) {
  try {
    await connectDB()

    let categories = null

    // ⭐ اگر هیچ فیلتری ارسال نشده، همه دسبته بندی ها را برگردان
    categories = await Categorys.find()


    return Response.json({
      success: true,
      count: categories.length,
      data: categories
    })

  } catch (error) {
    console.error('خطا در دریافت  دسته بندی محصولات:', error)
    return Response.json(
      { success: false, error: 'خطا در اتصال به دیتابیس' },
      { status: 500 }
    )
  }
}


// POST - ساخت دسبته بندی جدید
export async function POST(request) {

  try {
    await connectDB();

    const body = await request.json();


 // ======= اعتبارسنجی فیلدهای اصلی =======
if (!body.name ) {
  return Response.json(
    { error: "فیلدهای اصلی نام،  تعدداد دسته بندی الزامی هستند." },
    { status: 422 }
  );
}

    // ======= مقادیر پیش‌فرض =======
    const payload = {
      id: body.id || Date.now().toString(),
      name: body.name.trim(),
      img: body.img || "",
      products: body.products || 0,
    };

    try {
      const newCategory = await Categorys.create(payload);

      return Response.json(
        {
          success: true,
          data: newCategory
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
    console.error(" خطای سمت سرور خطا در افزودن دسته بندی:", error);

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
