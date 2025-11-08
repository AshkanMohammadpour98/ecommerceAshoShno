// نوع داده Category رو ایمپورت می‌کنیم (تعریف شده توی types/category.ts)
// این کمک می‌کنه تایپ‌اسکریپت بدونه item چه شکلیه (title, id, img)
import { Category } from "@/types/category";

// ری‌اکت و کتابخونه Image نکست برای بهینه‌سازی تصاویر
import React from "react";
import Image from "next/image";
import Link from "next/link";

// کامپوننت SingleItem: نمایش یک دسته‌بندی
// ورودی: item که از نوع Category هست
const SingleItem = ({ item }: { item: Category }) => {
  return (
    // کل آیتم رو داخل یک لینک (a) گذاشتیم
    // group = برای اعمال افکت hover روی اجزای داخلی
    <Link href={`/shopCategorie/${item.name}`} className="group flex flex-col items-center">
    {/* <Link href={item.link} className="group flex flex-col items-center"> */}
      
      {/* بخش تصویر دسته‌بندی */}
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4">
        {/* Image نکست → بهینه‌سازی، lazy loading، سایزبندی */}
        <Image 
          src={item.img=== null || "" || false ? "/images/notImg.png" : item.img}   // مسیر عکس که از categoryData میاد
          alt="Category"   // متن جایگزین (برای SEO و دسترسی)
          width={82}       // عرض عکس
          height={62}      // ارتفاع عکس
        />
      </div>

      {/* بخش عنوان دسته‌بندی */}
      <div className="flex justify-center">
        <h3
          className="
            inline-block font-medium text-center text-dark
            bg-gradient-to-r from-blue to-blue
            bg-[length:0px_1px] bg-left-bottom bg-no-repeat
            transition-[background-size] duration-500
            hover:bg-[length:100%_3px] 
            group-hover:bg-[length:100%_1px]
            group-hover:text-blue
          "
        >
          {item.name} {/* نمایش نام دسته‌بندی */}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
