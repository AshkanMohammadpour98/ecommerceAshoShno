// src/app/api/blogs/route.js
import Blog from '/models/Blog'
import connectDB from '/utils/ConnectDB'

// GET - دریافت همه بلاگ‌ها
export async function GET(request) {
  try {


    await connectDB()
    // دریافت query string
    const searchParams = request.nextUrl.searchParams
    console.log(searchParams);
    const categorieUR = searchParams.get('categorie')


    // const blogs = await Blog.find()
    let blogs = null
    if (categorieUR) {

      blogs = await Blog.find({ categorie: categorieUR })
      console.log(categorieUR);

    } else {
      console.log('category url notfond');
      blogs = await Blog.find()

    }

    return Response.json({
      success: true,
      count: blogs.length,
      data: blogs
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

// POST - ساخت بلاگ جدید
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()

    // اعتبارسنجی
    if (!body.title || !body.content) {
      return Response.json(
        { error: 'عنوان و محتوا الزامی است' },
        { status: 400 }
      )
    }

    try {
      const newBlog = await Blog.create(body)

      return Response.json(
        {
          success: true,
          data: newBlog
        },
        { status: 201 }
      )
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: error.message
        },
        { status: 422 }
      )
    }

  } catch (error) {
    console.error('خطا در ساخت بلاگ:', error)

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}