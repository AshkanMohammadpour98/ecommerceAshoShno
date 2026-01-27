import React from "react";
import Image from "next/image";

// داده‌های ویژگی‌ها
const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "ارسال رایگان",
    description: "برای تمام سفارشات بالای ۲۰۰ دلار",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "بازگشت ۱ به ۱",
    description: "امکان لغو تا ۱ روز بعد",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "پرداخت ۱۰۰٪ امن",
    description: "پرداخت امن و تضمینی",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "پشتیبانی ۲۴/۷",
    description: "در هر زمان و هر مکان",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-8 lg:py-15" dir="rtl">
      {/* بخش ویژگی‌ها */}
      {/* تغییر مهم: grid-cols-2 باعث می‌شود در موبایل دوتا دوتا کنار هم باشند */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-7.5 xl:gap-12.5 mt-10">
        {featureData.map((item, key) => (
          <div
            // تغییر: استفاده از flex-col در موبایل برای جا شدن بهتر و lg:flex-row در دسکتاپ
            // همچنین items-start برای تراز شدن بهتر متن‌های کوتاه و بلند
            className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 text-center lg:text-right group"
            key={key}
          >
            {/* آیکون ویژگی */}
            {/* سایز آیکون در موبایل کوچک‌تر (w-8) و در دسکتاپ بزرگتر (lg:w-10) شده است */}
            <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Image 
                src={item.img} 
                alt="icons" 
                width={40} 
                height={41} 
                className="w-8 h-8 lg:w-10 lg:h-10" 
              />
            </div>

            {/* عنوان و توضیحات ویژگی */}
            <div>
              {/* سایز فونت عنوان در موبایل sm و در دسکتاپ lg شده است */}
              <h3 className="font-medium text-sm lg:text-lg text-dark group-hover:text-blue transition-colors">
                {item.title}
              </h3>
              {/* سایز توضیحات در موبایل بسیار کوچک (text-[10px]) شده تا در دو ستون به خوبی جا شود */}
              <p className="text-[10px] sm:text-xs lg:text-sm mt-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;