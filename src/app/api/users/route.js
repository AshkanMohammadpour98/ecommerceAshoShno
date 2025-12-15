import Users from '/models/Users'
import connectDB from '/utils/ConnectDB'
import bcrypt from "bcrypt";

// GET - دریافت همه یوزرها
// GET - دریافت همه یوزرها یا جستجو بر اساس فیلدها
export async function GET(request) {
  try {
    await connectDB()

    // دریافت query string از URL
    const searchParams = request.nextUrl.searchParams
    const nameUR = searchParams.get('search') // جستجو بر اساس نام یا نام خانوادگی
    const genUR = searchParams.get('gen')     // جستجو بر اساس جنسیت ("male" یا "female")

    let user = null

    // ⭐ اگر هر دو فیلد search و gen پر باشند
    if (genUR && nameUR) {
      // جستجو کاربران با نام یا نام خانوادگی برابر nameUR
      // و جنسیت برابر genUR
      // مثال URL: /api/users?search=Ali&gen=male
      user = await Users.find({
        $and: [
          { gender: genUR },                   // فقط مرد یا زن
          { $or: [{ name: nameUR }, { lastName: nameUR }] } // نام یا نام خانوادگی
        ]
      })
    } 
    else if (nameUR) {
      // ⭐ فقط نام یا نام خانوادگی جستجو می‌شود
      // مثال URL: /api/users?search=Ali
      user = await Users.find({
        $or: [{ name: nameUR }, { lastName: nameUR }]
      })
    } 
    else if (genUR) {
      // ⭐ فقط بر اساس جنسیت فیلتر می‌کنیم
      // مثال URL: /api/users?gen=female
      if (genUR === 'male' || genUR === 'female') {
        user = await Users.find({ gender: genUR })
      } else {
        console.log('genUrl not male or female');
        user = []
      }
    } 
    else {
      // ⭐ اگر هیچ فیلتری ارسال نشده، همه کاربران را برگردان
      user = await Users.find()
    }

    return Response.json({
      success: true,
      count: user.length,
      data: user
    })

  } catch (error) {
    console.error('خطا در دریافت کاربران:', error)
    return Response.json(
      { success: false, error: 'خطا در اتصال به دیتابیس' },
      { status: 500 }
    )
  }
}


// POST - ساخت یوزر جدید
export async function POST(request) {
  
  try {
    await connectDB();

    const body = await request.json();
    

 // ======= اعتبارسنجی فیلدهای اصلی =======
if (!body.name || !body.lastName || !body.password || !body.role || !body.dateLogin) {
  return Response.json(
    { error: "فیلدهای اصلی نام، نام خانوادگی، رمز عبور، نقش و تاریخ ورود الزامی هستند." },
    { status: 422 }
  );
}

// ======= اعتبارسنجی طول پسورد =======
if (body.password.length < 6 || body.password.length > 20) {
  return Response.json(
    { error: "طول پسورد باید بین 6 تا 20 کاراکتر باشد" },
    { status: 422 }
  );
}

// ======= اعتبارسنجی وجود ایمیل یا شماره تلفن =======
if (!body.email && !body.phone) {
  return Response.json(
    { error: "حتما باید یک روش ثبت نام داشته باشید؛ ایمیل یا شماره تلفن" },
    { status: 422 }
  );
}

// ======= اعتبارسنجی ایمیل در صورت وجود =======
const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

if (body.email && body.email !== "") {
  if (!regexEmail.test(body.email)) {
    return Response.json(
      { error: "ایمیل نامعتبر است" },
      { status: 422 }
    );
  }
}


    // ======= مقادیر پیش‌فرض =======
    const payload = {
      id: body.id || Date.now().toString(),
      name: body.name.trim(),
      lastName: body.lastName.trim(),
      password: body.password.trim(),
      role: body.role,
      dateLogin: body.dateLogin,
      gender: body.gender || "male", // پیش‌فرض مرد
      phone: body.phone || "",
      email: body.email || "",
      SuggestedCategories: Array.isArray(body.SuggestedCategories) ? body.SuggestedCategories : [],
      PurchasedProducts: Array.isArray(body.PurchasedProducts) ? body.PurchasedProducts : [],
      purchaseInvoice: Array.isArray(body.purchaseInvoice) ? body.purchaseInvoice : [],
      img: body.img || "",
      address: body.address || "",
    };

    try {
      // برسی اینکه ایا اولین کاربر هست یانه اگه اولین کاربر باشه ادمین درنظر گرفته بشه
      const countUsers = await Users.countDocuments()
      // هش کردن پسورد وارد شده رو رمزنگاری میکنیم
      const hashedPassword = await bcrypt.hash(body.password , 12)
      const newUser = await Users.create({...payload , password : hashedPassword , role : countUsers > 0 ? "user" : "admin"});

      return Response.json(
        {
          success: true,
          data: newUser
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
    console.error(" خطای سمت سرور خطا در افزودن یوزر:", error);

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
