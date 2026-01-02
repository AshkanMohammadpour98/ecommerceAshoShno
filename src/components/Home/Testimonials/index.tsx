"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// اگر بخوای در صورت خطا به داده‌ی محلی برگردی، این خط رو نگه دار:
// import testimonialsData from "./testimonialsData";

import "swiper/css";
import "swiper/css/navigation";
import SingleItem from "./SingleItem";

type Testimonial = {
  review: string;
  authorName: string;
  authorImg: string;
  authorRole: string;
  id?: string | number;
};

// URLS
const COMMENTS_URL = process.env.NEXT_PUBLIC_API_COMMENTS_URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const Testimonials = () => {
  const sliderRef = useRef<any>(null);

  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const res = await fetch(`${BASE_URL}${COMMENTS_URL}`, {
        signal: controller.signal,
        // cache: "no-store", // اگر می‌خوای همیشه تازه بگیره
      });
      if (!res.ok) {
        throw new Error(`خطا در دریافت داده‌ها: ${res.status}`);
      }
      const json = await res.json();
      if (!Array.isArray(json.data)) {
        throw new Error("فرمت داده دریافتی معتبر نیست (باید آرایه باشد).");
      }
      setData(json.data as Testimonial[]);
    } catch (e: any) {
      // اگر می‌خوای در صورت خطا به داده محلی برگردی، این بخش رو باز کن:
      // setData(testimonialsData as Testimonial[]);
      setError(e?.message || "مشکلی پیش آمده است.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  return (
    <section className="overflow-hidden pb-16.5" dir="rtl">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="swiper testimonial-carousel common-carousel p-5">
          {/* عنوان و ناوبری */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-08.svg"
                  alt="آیکون"
                  width={17}
                  height={17}
                />
                نظرات کاربران
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                بازخورد کاربران
              </h2>
            </div>

            {/* دکمه‌های قبلی/بعدی */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="swiper-button-prev cursor-pointer"
                aria-label="اسلاید قبلی"
                title="قبلی"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* راست */}
                  <path
                    d="M8 6L16 12L8 18"
                    stroke="#3C50E0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="swiper-button-next cursor-pointer"
                aria-label="اسلاید بعدی"
                title="بعدی"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* چپ */}
                  <path
                    d="M16 6L8 12L16 18"
                    stroke="#3C50E0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* وضعیت‌ها: لودینگ / خطا / دیتا */}
          {loading ? (
            // اسکلتون کارت‌ها هنگام لود
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[10px] bg-white shadow-2 p-6 animate-pulse"
                >
                  <div className="h-16 bg-gray-2 rounded-md mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-2 rounded w-11/12" />
                    <div className="h-3 bg-gray-2 rounded w-10/12" />
                    <div className="h-3 bg-gray-2 rounded w-8/12" />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-2" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-2 rounded w-1/2 mb-1" />
                      <div className="h-3 bg-gray-2 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // پیام خطا + تلاش مجدد
            <div className="bg-red-light-6 border border-red-light-4 rounded-md p-4 text-red">
              <p className="mb-3">خطا در دریافت نظرات کاربران: {error}</p>
              <button
                onClick={fetchTestimonials}
                className="inline-flex items-center gap-2 rounded-md bg-blue text-white px-4 py-2 hover:bg-blue-dark transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <Swiper
              ref={sliderRef}
              slidesPerView={3}
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 1 },
                1000: { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
              }}
            >
              {data.map((item, key) => (
                <SwiperSlide key={item.id ?? `${item.authorName}-${key}`}>
                  <SingleItem testimonial={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;