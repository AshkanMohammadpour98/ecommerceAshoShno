"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules"; // فعال کردن ماژول Navigation
import { useRef, useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL

import SingleItem from "./SingleItem";

const Categories = () => {
  const sliderRef = useRef<any>(null);
  const [categoriesHeaderData , setCategoriesHeaderDadta] = useState([])

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.swiper.init();
    }
    const fetchProduct = async () => {
      try {
            // گرفتن دسته‌بندی‌ها
    fetch(`${BASE_URL}${CATEGORYS_URL}`)
      .then((res) => res.json())
      .then((data) => setCategoriesHeaderDadta(data.data))
      .catch(() => setCategoriesHeaderDadta([]));
        
      } catch (error) {
        console.error("خطا در دریافت دسته بندی های هدر:", error);
      }
    
    };
    fetchProduct();
  }, []);

  // console.log(categoriesHeaderData + 'categoriesHeaderData');
  
  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* بخش عنوان */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_834_7356)">
                    <path
                      d="M3.94024 13.4474C2.6523 12.1595 2.00832 11.5155 1.7687 10.68C1.52908 9.84449 1.73387 8.9571 2.14343 7.18231L2.37962 6.15883C2.72419 4.66569 2.89648 3.91912 3.40771 3.40789C3.91894 2.89666 4.66551 2.72437 6.15865 2.3798L7.18213 2.14361C8.95692 1.73405 9.84431 1.52927 10.6798 1.76889C11.5153 2.00851 12.1593 2.65248 13.4472 3.94042L14.9719 5.46512C17.2128 7.70594 18.3332 8.82635 18.3332 10.2186C18.3332 11.6109 17.2128 12.7313 14.9719 14.9721C12.7311 17.2129 11.6107 18.3334 10.2184 18.3334C8.82617 18.3334 7.70576 17.2129 5.46494 14.9721L3.94024 13.4474Z"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="7.17245"
                      cy="7.39917"
                      r="1.66667"
                      transform="rotate(-45 7.17245 7.39917)"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9.61837 15.4164L15.4342 9.6004"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_834_7356">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                دسته‌بندی‌ها
              </span>

              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                جستجو بر اساس دسته
              </h2>
            </div>

            {/* دکمه‌های کنترل */}
            <div className="flex items-center gap-3">
              {/* فلش قبلی → سمت راست */}
              <button className="swiper-button-prev">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6L16 12L8 18" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* فلش بعدی → سمت چپ */}
              <button className="swiper-button-next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 6L8 12L16 18" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>


          </div>

          {/* Swiper */}
          <Swiper
            ref={sliderRef}
            modules={[Navigation]} // فعال کردن ماژول Navigation
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            slidesPerView={6}
            breakpoints={{
              0: { slidesPerView: 2 },
              1000: { slidesPerView: 4 },
              1200: { slidesPerView: 6 },
            }}
          >
            {categoriesHeaderData.map((item, key) => (
              <SwiperSlide key={key}>
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;
