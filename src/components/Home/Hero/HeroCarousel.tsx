"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// استایل‌های Swiper
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { useEffect, useState } from "react";

// کامپوننت اسلایدر هدر
const HeroCarousal = () => {
  const [productsDataBennerHomeData, setProductsDataBennerHomeData] = useState([])
  useEffect(() => {
    fetch("http://localhost:3000/bennerHomeData")
      .then((res) => res.json())
      .then((data) => setProductsDataBennerHomeData(data))
      .catch(() => setProductsDataBennerHomeData([]));
  })
  return (
    <Swiper
      spaceBetween={30} // فاصله بین اسلایدها
      centeredSlides={true} // اسلاید وسط صفحه متمرکز شود
      autoplay={{
        delay: 2500, // مدت زمان تغییر اسلاید به میلی‌ثانیه
        disableOnInteraction: false, // توقف خودکار هنگام تعامل کاربر
      }}
      pagination={{
        clickable: true, // امکان کلیک روی دات‌ها
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >


      {/*اسلایدر*/}
{
  productsDataBennerHomeData.map(item => (
          <SwiperSlide>
        
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row-reverse">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                    {/* ۳۰٪ */}
                    {item.discountedPrice ? item.discountedPrice : item.price}
                  </span>
                  {
                    item.discountedPrice && (
                      <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                        تخفیف
                        <br />
                        ویژه
                      </span>
                    )
                  }
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <a href="#">هدفون بی‌سیم با حذف نویز واقعی</a>
                </h1>

                <p>
                  {
                    item.title
                  }
                </p>

                <a
                  href="#"
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                >
                  خرید کنید
                </a>
              </div>

              <div>
                <Image
                  src={item.imgs.thumbnails[0]}
                  alt="headphone"
                  width={351}
                  height={358}
                />
              </div>
            </div>
      </SwiperSlide>
  ))
}
    </Swiper>
  );
};

export default HeroCarousal;
