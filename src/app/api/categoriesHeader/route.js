 const categoriesHeaderData = [
  {
    // عنوان دسته‌بندی (نمایش داده میشه توی UI)
    // می‌تونی آزادانه متنش رو تغییر بدی → مشکلی پیش نمیاد
    title: "Televisions",  

    // شناسه دسته‌بندی (unique ID)
    // معمولاً تغییرش مشکلی نداره ولی بهتره هر id یکتا باشه
    id: 1,

    // مسیر تصویر دسته‌بندی
    // اگه تغییر بدی باید مطمئن باشی اون فایل توی پوشه public/images/... وجود داشته باشه
    img: "/images/categories/categories-01.png",
    // یه اتربیوت لینک اضافه کردیم برای مسیر دادنش
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Laptop & PC",
    id: 2,
    img: "/images/categories/categories-02.png",
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Mobile & Tablets",
    id: 3,
    img: "/images/categories/categories-03.png",
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Games & Videos",
    id: 4,
    img: "/images/categories/categories-04.png",
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Home Appliances",
    id: 5,
    img: "/images/categories/categories-05.png",
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Health & Sports",
    id: 6,
    img: "/images/categories/categories-06.png",
    link : "/shopCategorie/Televisions"
  },
  {
    title: "Watches",
    id: 7,
    img: "/images/categories/categories-07.png",
    link : "/shopCategorie/Watch"
  },
  {
    title: "Televisions", // 🔴 تکراریه! می‌تونی تغییرش بدی (مثلاً "Cameras")
    id: 8,
    img: "/images/categories/categories-04.png",
    link : "/shopCategorie/Televisions"
  },
];

export async function GET() {
    return Response.json(categoriesHeaderData)
    
}