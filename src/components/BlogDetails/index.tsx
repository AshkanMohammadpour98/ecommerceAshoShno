// 📄 این صفحه جزئیات کامل یک مقاله (بلاگ) را نمایش می‌دهد

import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";

const BlogDetails = () => {
  return (
    <>
      {/* ✅ مسیر ناوبری بالای صفحه (Breadcrumb) */}
      <Breadcrumb title={"جزئیات مقاله"} pages={["جزئیات مقاله"]} />

      <section dir="rtl" className="overflow-hidden py-20 bg-gray-2 text-right">
        <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* ✅ تصویر اصلی مقاله */}
          <div className="rounded-[10px] overflow-hidden mb-7.5">
            <Image
              className="rounded-[10px]"
              src="/images/blog/blog-details-01.jpg"
              alt="جزئیات مقاله"
              width={750}
              height={477}
            />
          </div>

          <div>
            {/* ✅ تاریخ انتشار و تعداد بازدید */}
            <span className="flex items-center gap-3 mb-4 text-gray-600 text-sm">
              <a href="#" className="ease-out duration-200 hover:text-blue">
                ۲۷ اسفند ۱۴۰۰
              </a>

              <span className="block w-px h-4 bg-gray-4"></span>

              <a href="#" className="ease-out duration-200 hover:text-blue">
                ۳۰۰ هزار بازدید
              </a>
            </span>

            {/* ✅ عنوان مقاله */}
            <h2 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-4">
              برای ارسال محصول چه اطلاعاتی لازم است؟
            </h2>

            {/* ✅ پاراگراف‌های توضیحات مقاله */}
            <p className="mb-6 leading-7">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است. این متن فقط برای تست ظاهر بخش
              مقاله نوشته شده است.
            </p>

            <p className="mb-6 leading-7">
              این متن نمایشی است و نشان می‌دهد که محتوای واقعی در صفحه
              چگونه قرار خواهد گرفت. هدف فقط پر کردن بخش مقاله و شبیه‌سازی
              محتوای واقعی است.
            </p>

            <p className="leading-7">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم. این بخش توضیحات
              بیشتری در مورد مقاله می‌دهد تا تجربه واقعی‌تری از خواندن داشته
              باشید.
            </p>

            {/* ✅ بخش لیست نکات */}
            <div className="mt-7.5">
              <h3 className="font-medium text-dark text-lg xl:text-[26px] xl:leading-[34px] mb-6">
                نکات مهم در طراحی تجربه کاربری
              </h3>

              <ul className="list-disc pr-6 leading-8">
                <li>تجربه کاربری خوب باعث افزایش فروش می‌شود.</li>
                <li>طراحی رابط کاربری نیاز به خلاقیت و دقت دارد.</li>
                <li>سادگی و کاربردپذیری مهم‌ترین اصول طراحی هستند.</li>
                <li>هماهنگی رنگ‌ها تأثیر زیادی در جذابیت بصری دارد.</li>
              </ul>
            </div>

            {/* ✅ نقل‌قول (Quote) */}
            <div className="rounded-xl bg-white pt-7.5 pb-6 px-4 sm:px-7.5 my-7.5">
              <p className="italic text-dark text-center">
                ‘‘یک جمله انگیزشی یا نقل‌قول از نویسنده مقاله در این بخش
                نمایش داده می‌شود.’’
              </p>
              <span className="block text-center mt-4 text-sm text-gray-500">
                – نویسنده مقاله
              </span>
            </div>

            {/* ✅ بخش نویسنده مقاله */}
            <div className="flex items-center gap-4 mt-10 p-5 rounded-xl bg-white shadow">
              <Image
                src="/images/blog/author.jpg" 
                alt="نویسنده مقاله"
                width={70}
                height={70}
                className="rounded-full"
              />
              <div>
                <h4 className="font-medium text-lg text-dark">
                  علی رضایی
                </h4>
                <p className="text-sm text-gray-600">
                  نویسنده و تولیدکننده محتوا در زمینه طراحی تجربه کاربری
                </p>
              </div>
            </div>

            {/* ✅ بخش نظرات */}
            <div className="mt-12">
              <h3 className="font-medium text-xl mb-6">نظرات کاربران</h3>

              {/* یک نظر نمونه */}
              <div className="mb-6 p-4 border rounded-xl bg-white">
                <h5 className="font-medium">مریم</h5>
                <p className="text-sm text-gray-600 mt-2 leading-6">
                  مقاله خیلی مفیدی بود 🌹 خیلی چیزهای جدید یاد گرفتم.
                </p>
              </div>

              <div className="mb-6 p-4 border rounded-xl bg-white">
                <h5 className="font-medium">حسین</h5>
                <p className="text-sm text-gray-600 mt-2 leading-6">
                  توضیحات کامل و کاربردی بود، منتظر مقالات بعدی هستم 🙌
                </p>
              </div>
            </div>

            {/* ✅ فرم ارسال نظر */}
            <div className="mt-12">
              <h3 className="font-medium text-xl mb-6">ارسال نظر</h3>

              <form className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="نام شما"
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue"
                />
                <textarea
                  placeholder="نظر شما"
                  rows={4}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue"
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue text-white py-3 rounded-lg hover:bg-dark transition"
                >
                  ارسال نظر
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetails;
