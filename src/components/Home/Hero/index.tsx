"use client"
import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";


// کامپوننت اصلی هدر سایت
// URLS
const CHAILD_BENNER_HOME_URL = process.env.NEXT_PUBLIC_API_CHAILD_BENNER_HOME_URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const Hero = () => {
  const [productsDataBennerChildHomeData, setProductsDataBennerChildHomeData] = useState([])
  useEffect(() => {
    fetch(`${BASE_URL}${CHAILD_BENNER_HOME_URL}`)
      .then((res) => res.json())
      .then((data) => setProductsDataBennerChildHomeData(data.data))
      .catch(() => setProductsDataBennerChildHomeData([]));
  } , [])
  
  return (
    <section className="overflow-hidden bg-[#E5EAF4] 
  pb-10 lg:pb-15 
  pt-[100px] sm:pt-[120px] lg:pt-[140px] xl:pt-[180px]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          {/* بخش اسلایدر اصلی */}
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* تصاویر پس‌زمینه */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              {/* فراخوانی اسلایدر */}
              <HeroCarousel />
            </div>
          </div>

          {/* بخش محصولات ویژه کنار اسلایدر */}
          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {/* کارت محصول هدر */}
              {
                productsDataBennerChildHomeData.map(item => (
                  <div key={item.id} className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center gap-14 flex-row-reverse"> {/* راست‌چین کردن */}
                      <div>
                        <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                          <a href={`/shop-details/${item._id}`}>{item.title}</a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            پیشنهاد محدود
                          </p>
                          <span className="flex items-center gap-3">
                            {
                              item.discountedPrice ? (
                                <>
                                  <span className="font-medium text-heading-5  text-blue-dark hover:text-blue ">
                                    {item.discountedPrice.toLocaleString()}$
                                  </span>
                                  <span className="font-medium text-2xl  line-through  text-red-dark hover:text-red">
                                    {item.price.toLocaleString()}$
                                  </span></>
                              ) :
                                (
                                  <span className="font-medium text-heading-5 text-blue-dark hover:text-blue ">
                                    {item.price.toLocaleString()}$
                                  </span>
                                )
                            }
                          </span>
                        </div>
                      </div>

                      <div>
                        <Image
                          src={item.imgs.thumbnails[0]}
                          alt={item.title ? item.title : "product image slaidbar"}
                          width={123}
                          height={161}
                        />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* ویژگی‌های هدر */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
