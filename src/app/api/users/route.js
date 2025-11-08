// src/app/api/users/route.js
import Users from '/models/Users'
import connectDB from '/utils/ConnectDB'
// GET - دریافت همه یوزرها
export async function GET(request) {
  try {

    await connectDB()
    // دریافت query string
    const searchParams = request.nextUrl.searchParams
    // console.log(searchParams);
    const nameUR = searchParams.get('search')
    const genUR = searchParams.get('gen')

    let user = null
    if (genUR && nameUR) {
      user = await Users.find({
        $and: [
          { gender: genUR },
          { $or: [{ name: nameUR }, { lastName: nameUR }] }
        ]
      })
    }
    else if (nameUR) {
      // سرچ براساس name , lastName
      // /api/users?search=یاسر
      user = await Users.find({ $or: [{ name: nameUR }, { lastName: nameUR }] })
      console.log(nameUR);

    } else if (genUR) {
      // سرچ بر اساس جنسیت 
      // /api/users?gen=male
      if (genUR == 'male' || genUR == 'female') {
        user = await Users.find({ gender: genUR })

        // سرچ بر اساس جنسیت و سرچ نام و نام خانوادگی
        // /api/users?gen=female&search=یکاو
      }
      else {
        console.log('genUrl not male or female');

      }

    }
    else {
      console.log('url notfond');
      user = await Users.find()

    }

    return Response.json({
      success: true,
      count: user.length,
      data: user
    })

  } catch (error) {
    console.error('خطا در دریافت بلاگ‌ها:', error)

    return Response.json(
      {
        success: false,
        error: 'خطا در اتصال به دیتابیس'
      },
      { status: 500 }
    )
  }
}
export async function POST()

