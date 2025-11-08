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
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      {/* بخش ویژگی‌ها */}
      <div className="flex flex-wrap items-center gap-7.5 xl:gap-12.5 mt-10">
        {featureData.map((item, key) => (
          <div
            className="flex items-center gap-4 flex-row-reverse" // راست‌چین کردن محتوا
            key={key}
          >
            {/* آیکون ویژگی */}
            <Image src={item.img} alt="icons" width={40} height={41} />

            {/* عنوان و توضیحات ویژگی */}
            <div>
              <h3 className="font-medium text-lg text-dark">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
