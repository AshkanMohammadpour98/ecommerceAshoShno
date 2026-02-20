
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import {
  StarIcon, ShoppingBagIcon, ShieldCheckIcon, TruckIcon,
  ArrowPathIcon, HeartIcon, ShareIcon, QrCodeIcon,
  ClipboardDocumentIcon, ChevronLeftIcon, ChevronRightIcon,
  MagnifyingGlassPlusIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import Swal from "sweetalert2";
import { addItemToCart } from "@/redux/features/cart-slice";



// Swiper Styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { AppDispatch } from "@/redux/store";
import { RootState } from "@/redux/store";

// URLS - تنظیمات API
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL

// 🎯 تنظیمات ظاهری وضعیت محصول
const CONDITION_STYLES: Record<string, string> = {
  "نو آکبند": "bg-green-100 text-green-700",
  "در حد نو": "bg-blue-100 text-blue-700",
  "استوک": "bg-orange-100 text-orange-700",
  "کارکرده": "bg-red-100 text-red-700",
};


const ProductDetails = () => {
  const params = useParams();
  const shopDetailsId = params?.shopDetailsId; // این همان _id محصول است

  // States
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [showStickyBar, setShowStickyBar] = useState(false);
  // const [isFavorite, setIsFavorite] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);


  // گرفتن لیست علاقه‌مندی‌ها از redux
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlistReducer.items
  );
  // 🧾 نوع آیتم داخل سبد خرید
  type CartItem = {
    id: number;
    quantity: number;
    count: number;
  };

  // 🛒 گرفتن آیتم‌های سبد خرید از redux (Type-safe)
  const cartItems = useSelector(
    (state: RootState) => state.cartReducer.items as CartItem[]
  );
  // بررسی اینکه آیا این محصول داخل wishlist هست یا نه
  // بررسی اینکه آیا این محصول قبلاً داخل wishlist بوده یا نه
  const isFavorite = useMemo(() => {
    return wishlistItems.some((item) => item.id === product?.id);
  }, [wishlistItems, product]);

  // 🔍 بررسی اینکه این محصول قبلاً داخل cart بوده یا نه
  const cartItem = useMemo(() => {
    return cartItems.find(item => item.id === product?.id);
  }, [cartItems, product]);



  const handleToggleWishlist = () => {
    if (!product) return;

    if (isFavorite) {
      // اگر قبلاً داخل wishlist بوده → حذف شود
      dispatch(removeItemFromWishlist(product.id));
    } else {
      // اگر داخل wishlist نبوده → اضافه شود
      dispatch(
        addItemToWishlist({
          ...product, quantity: 1,
        })
      );
    }
  };
  // واکشی اطلاعات از API (ساختار کد فعلی شما)
  useEffect(() => {
    if (!shopDetailsId) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BASE_URL}${PRODUCTS_URL}/${shopDetailsId}`);
        const result = await res.json();
        if (result.success) setProduct(result.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [shopDetailsId]);

  // کنترل نوار چسبان پایین (Sticky Bar)
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ♻️ sync qty با cart وقتی کاربر برمی‌گردد
  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(1);
    }
  }, [cartItem]);

  // محاسبات تخفیف (از کد شما)
  const discountPercent = useMemo(() => {
    if (!product?.hasDiscount || !product?.discountedPrice || !product?.price) return 0;
    return Math.round(100 - (product.discountedPrice / product.price) * 100);
  }, [product]);

  // محاسبه میزان سود کاربر از خرید (صرفه جویی)
  const savedAmount = useMemo(() => {
    if (!product?.hasDiscount) return 0;
    return product.price - product.discountedPrice;
  }, [product]);
  const dispatch = useDispatch<AppDispatch>();



  // فرمت کردن قیمت به تومان (از استایل کد قبلی)
  const formatPrice = (n: number) => new Intl.NumberFormat("fa-IR").format(n);

  // توابع کمکی اشتراک گذاری و کپی
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch (err) { console.log(err) }
    } else {
      navigator.clipboard.writeText(url);
      alert("لینک کپی شد");
    }
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse font-bold">در حال بارگذاری اطلاعات محصول...</div>;
  if (!product) return <div className="text-center py-20 font-bold text-red-500">محصول یافت نشد.</div>;

  // =============================
  // 🧮 محاسبه موجودی واقعی محصول
  // =============================

  // موجودی کل محصول
  const totalStock = product.count ?? 0;

  // تعداد این محصول داخل سبد خرید
  const quantityInCart = cartItem?.quantity ?? 0;

  // موجودی باقی‌مانده قابل انتخاب
  // 📦 موجودی قابل انتخاب (با درنظر گرفتن qty فعلی)
  const remainingStock = Math.max(
    totalStock - (quantityInCart - qty),
    0
  );


  // 🧪 edge-case: محصول ناموجود
  const isOutOfStock = totalStock === 0;


  const productImages = product.imgs?.previews || ["/placeholder.png"];
  // برای ستاره‌های امتیاز
  const totalStars = 5;
  const ratingValue = Number(product.reviews) || 0;
  const safeFilled = Math.min(Math.max(ratingValue, 0), totalStars);




  return (
    // flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row-reverse
    <div className="bg-[#F9FAFB] mt-25 min-h-screen pb-24 font-euclid" dir="rtl">

      {/* Breadcrumb مدرن و مینیمال */}
      <div className="max-w-[1440px] mt-10 mx-auto px-4 md:px-10 py-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">خانه</Link>
          <ChevronLeftIcon className="w-3 h-3" />
          <Link href="/shop-with-sidebar" className="hover:text-blue-600 transition">فروشگاه</Link>
          <ChevronLeftIcon className="w-3 h-3" />
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">

          {/* بخش گالری تصاویر (5 ستون) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-blue-900/5 border border-gray-50 relative group">
              <Swiper
                spaceBetween={10}
                navigation={true}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="rounded-3xl"
              >
                {productImages.map((img: string, i: number) => (
                  <SwiperSlide key={i}>
                    <div className="aspect-square flex items-center justify-center p-6 cursor-zoom-in" onClick={() => setLightbox(true)}>
                      <img src={img} alt={product.title} className="max-h-full object-contain" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* نشان تخفیف روی تصویر */}
              {product.hasDiscount && (
                <div className="absolute top-6 right-6 z-10 bg-red text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg animate-bounce">
                  {discountPercent}% تخفیف ویژه
                </div>
              )}

              {/* دکمه بزرگنمایی (Lightbox Trigger) */}
              <button
                onClick={() => setLightbox(true)}
                className="absolute bottom-6 left-6 z-10 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-sm hover:bg-white transition-all text-gray-600"
              >
                <MagnifyingGlassPlusIcon className="w-6 h-6" />
              </button>
            </div>

            {/* تصاویر بندانگشتی (Thumbnails) */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbs-swiper px-2"
            >
              {productImages.map((img: string, i: number) => (
                <SwiperSlide key={i} className="cursor-pointer">
                  <div className="aspect-square rounded-2xl border-2 border-transparent bg-white p-2 shadow-sm transition-all overflow-hidden">
                    <img src={img} className="w-full h-full object-contain" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* بخش اطلاعات محصول (7 ستون) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-50">

              {/* عنوان و دکمه‌های کنترلی */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{product.title}</h1>
                {/* وضعیت محصول (نو، استوک، کارکرده و...) */}
                {/* وضعیت محصول */}
                {product.condition && (
                  <div
                    className={`
      mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
      text-xs font-black
      ${CONDITION_STYLES[product.condition] || "bg-gray-100 text-gray-600"}
    `}
                  >
                    <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                    {product.condition}
                  </div>
                )}

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleToggleWishlist}
                    aria-label={isFavorite ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
                    title={isFavorite ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
                    className={`p-3 rounded-2xl transition-all duration-200 
    ${isFavorite
                        ? "bg-red-50 text-red-500 scale-110"
                        : "bg-gray-50 text-gray-400 hover:text-red-500"
                      }
  `}
                  >
                    <HeartIcon
                      className={`w-6 h-6 transition-all ${isFavorite ? "fill-current scale-110" : ""
                        }`}
                    />
                  </button>


                  <button onClick={handleShare} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-500 transition-all">
                    <ShareIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* ======== بخش امتیاز محصول ======== */}
              <div className="flex items-center gap-2.5 mb-2">
                <div style={{ display: "flex", gap: "4px" }}>
                  {[...Array(totalStars)].map((_, i) => {
                    if (i < Math.floor(safeFilled)) {
                      return (
                        <Image
                          key={i}
                          src="/images/icons/icon-star.svg"
                          alt="star"
                          width={15}
                          height={15}
                        />
                      );
                    }
                    if (i === Math.floor(safeFilled) && safeFilled % 1 >= 0.5) {
                      return (
                        <Image
                          key={i}
                          src="/images/icons/icon-star-half.svg"
                          alt="half-star"
                          width={15}
                          height={15}
                        />
                      );
                    }
                    return (
                      <svg
                        key={i}
                        className="fill-gray-4"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                          fill=""
                        />
                      </svg>
                    );
                  })}
                </div>
                <p className="text-custom-sm">({product.reviews})</p>
              </div>


              {/* قیمت گذاری و انتخاب تعداد */}
              <div className="bg-slate-50 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  {/* نمایش موجودی */}
                  {!isOutOfStock && (
                    <p className="text-xs text-gray-400 font-bold mb-2">
                      {product.count} عدد
                    </p>
                  )}

                  {isOutOfStock && (
                    <p className="text-xs text-red-500 font-bold mb-2">
                      ناموجود
                    </p>
                  )}

                  <p className="text-xs font-bold text-gray-400 mb-2">قیمت مصرف‌کننده</p>
                  <div className="flex items-center gap-4">
                    {product.hasDiscount ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-black text-blue-600 tracking-tighter">
                            {formatPrice(product.discountedPrice)} <span className="text-lg">تومان</span>
                          </span>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg">%{discountPercent}</span>
                        </div>
                        <span className="text-lg text-gray-300 line-through decoration-red-400">{formatPrice(product.price)}</span>
                        <p className="text-green-600 text-xs font-bold mt-1">سود شما: {formatPrice(savedAmount)} تومان</p>
                      </div>
                    ) : (
                      <span className="text-4xl font-black text-gray-800 tracking-tighter">
                        {formatPrice(product.price)} <span className="text-lg">تومان</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* استپر انتخاب تعداد */}
                {/* 
  استپر تعداد:
  1. maxQty = موجودی محصول.
  2. دکمه + از اضافه شدن بیشتر از موجودی جلوگیری می‌کند.
  3. دکمه - حداقل 1 نگه می‌دارد.
*/}

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (remainingStock === 0) return;
                      setQty(q => Math.min(q + 1, remainingStock));
                    }}
                    disabled={remainingStock === 0 || qty >= remainingStock}
                    className={`w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl font-bold transition-all
    ${remainingStock === 0 || qty >= remainingStock
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600 hover:text-white"
                      }
  `}
                  >
                    +
                  </button>

                  <span className="w-8 text-center font-black text-xl">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))} // حداقل ۱
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    -
                  </button>
                </div>
              </div>

              {/* دکمه‌های اصلی خرید */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="bg-blue-light hover:bg-blue-700 text-white h-16 rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                  onClick={() => {
                    // 🚫 بررسی موجودی باقی‌مانده
                    if (remainingStock === 0) {
                      Swal.fire({
                        icon: "error",
                        title: "این محصول ناموجود است",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      return;
                    }

                    // 🚫 بررسی اینکه تعداد انتخابی بیشتر از موجودی نباشد
                    if (qty > remainingStock) {
                      Swal.fire({
                        icon: "error",
                        title: `فقط ${remainingStock} عدد باقی مانده`,
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      setQty(remainingStock || 1); // تنظیم مجدد تعداد انتخابی
                      return;
                    }

                    // 🔄 بررسی تعداد موجود در سبد قبل از افزودن
                    const existedQty = cartItem?.quantity ?? 0;

                    // ✅ افزودن یا بروزرسانی محصول در سبد خرید با ریداکس
                    dispatch(addItemToCart({
                      id: product.id,         // front-end id
                      _id: product._id,       // database id
                      title: product.title,
                      price: product.price,
                      discountedPrice: product.discountedPrice || product.price,
                      quantity: qty,
                      count: product.count,
                      imgs: product.imgs,
                    }));

                    // ✅ پیام هوشمند بر اساس وضعیت سبد
                    if (existedQty > 0) {
                      // 🟡 اگر محصول قبلاً در سبد بوده → اطلاع بده و تعداد جدید را نمایش بده
                      Swal.fire({
                        icon: "info",
                        title: "محصول قبلاً در سبد شما بوده",
                        html: `
        <p style="font-size:14px">
          در حال حاضر <b>${existedQty}</b> عدد از این محصول در سبد شما وجود دارد.
          <br/>
          تعداد جدید به <b>${existedQty + qty}</b> عدد بروزرسانی شد.
        </p>
      `,
                        timer: 2200,
                        showConfirmButton: false,
                      });
                    } else {
                      // 🟢 اگر محصول جدید است → پیام موفقیت
                      Swal.fire({
                        icon: "success",
                        title: "محصول به سبد خرید اضافه شد",
                        showConfirmButton: false,
                        timer: 1500,
                      });
                    }
                  }}


                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  افزودن به سبد خرید
                </button>

                <button className="bg-gray-900 hover:bg-black text-white h-16 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3">
                  خرید سریع و آنی
                </button>
              </div>

              {/* باکس‌های اعتماد (از استایل کد دوم) */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-600">
                  <TruckIcon className="w-5 h-5 text-blue-500" /> ارسال سریع کشوری
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500" /> ضمانت اصالت کالا
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-600">
                  <ArrowPathIcon className="w-5 h-5 text-orange-500" /> ۷ روز ضمانت بازگشت
                </div>
              </div>

              {/* بررسی زمان ارسال (از کد دوم) */}
              <div className="mt-6 p-4 rounded-3xl border border-dashed border-gray-200 bg-slate-50/30 flex flex-col sm:flex-row items-center gap-4">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">بررسی زمان تحویل:</span>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="کد پستی را وارد کنید..."
                    className="w-full bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm outline-none focus:border-blue-400 transition-all"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <button className="absolute left-1 top-1 bottom-1 bg-gray-4 hover:bg-gray-5 px-4 rounded-lg text-xs font-bold transition-all">بررسی</button>
                </div>
              </div>

              {/* QR Code اختصاصی محصول (از کد اول شما) */}
              {product.QRDatas?.preview?.url && (
                <div className="mt-6 p-4 border border-blue-50 bg-blue-50/20 rounded-3xl flex items-center gap-4">
                  <div className="bg-white p-2 rounded-2xl shadow-sm border border-white">
                    <img src={product.QRDatas.preview.url} className="w-16 h-16" alt="QR" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-800 text-sm">شناسنامه دیجیتال</h4>
                    <p className="text-[10px] text-gray-400 mt-1">این محصول دارای اصالت دیجیتال است.</p>
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("لینک محصول کپی شد");
                  }} className="flex items-center gap-2 text-xs font-bold text-blue-light bg-white border border-blue px-4 py-2 rounded-xl hover:bg-blue hover:text-white transition-all">
                    <ClipboardDocumentIcon className="w-4 h-4" /> کپی لینک
                  </button>
                </div>
              )}
            </div>

            {/* بخش تب‌ها (مشخصات، توضیحات، نظرات) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-50">
              <div className="flex gap-4 border-b border-gray-50 mb-8 pb-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'desc', label: 'توضیحات', icon: ArrowPathIcon },
                  { id: 'specs', label: 'مشخصات فنی', icon: ShieldCheckIcon },
                  { id: 'reviews', label: 'دیدگاه کاربران', icon: StarIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-light text-white shadow-lg shadow-blue-light-3' : 'text-gray-400 hover:bg-gray-5 hover:text-gray-1'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="prose max-w-none text-gray-600 leading-9">
                {activeTab === 'desc' && (
                  <div className="space-y-6">

                    {/* توضیح کوتاه محصول (Short Description) */}
                    {product.description?.short && (
                      <div className="bg-blue-50/60 border border-blue-100 p-6 rounded-3xl text-sm font-bold text-gray-700 leading-8">
                        {product.description.short}
                      </div>
                    )}

                    {/* توضیح سیستمی محصول */}
                    <p className="text-justify bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-sm text-gray-500">
                      این محصول با شناسه اختصاصی <span className="text-blue-600 font-bold">{product._id}</span> در تاریخ {product.date} به لیست محصولات آسو شنو اضافه شده است.
                    </p>

                    {/* توضیحات کامل (Full Description) */}
                    <div className="text-sm leading-8 text-gray-600 whitespace-pre-line">
                      {product.description?.full
                        ? product.description.full
                        : "توضیحات تکمیلی برای این محصول ثبت نشده است."}
                    </div>

                  </div>
                )}


                {activeTab === "specs" && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* مشخصات پایه */}
                    <SpecRow label="دسته‌بندی" value={product.categorie} />
                    <SpecRow label="کد اختصاصی" value={product._id} isMono />
                    <SpecRow
                      label="وضعیت انبار"
                      value={`${product.count} عدد موجود`}
                      isGreen
                    />
                    <SpecRow label="تاریخ درج" value={product.date} />

                    {/* ================= QR CODE ================= */}
                    {product?.QRDatas?.config?.value && (
                      <div
                        className="md:col-span-2 mt-4 p-5 rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 to-white flex flex-col sm:flex-row gap-6 items-center"
                      >
                        {/* QR Preview */}
                        <div className="shrink-0 bg-white p-4 rounded-2xl border shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                              product.QRDatas.config.value
                            )}`}
                            alt="QR Code"
                            className="w-32 h-32 object-contain"
                          />
                        </div>

                        {/* QR Details */}
                        <div className="flex-1 w-full space-y-3 text-sm">

                          <div className="flex items-center gap-2 font-black text-blue-700">
                            <QrCodeIcon className="w-5 h-5" />
                            شناسنامه دیجیتال محصول
                          </div>

                          <p className="text-gray-600 text-xs leading-6 break-all bg-white rounded-xl p-3 border">
                            {product.QRDatas.config.value}
                          </p>

                          {product.QRDatas.dateAddQrCode && (
                            <p className="text-[11px] text-gray-400 font-bold">
                              تاریخ ایجاد QR: {product.QRDatas.dateAddQrCode}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  product.QRDatas.config.value
                                );
                                Swal.fire({
                                  icon: "success",
                                  title: "لینک QR کپی شد",
                                  timer: 1200,
                                  showConfirmButton: false,
                                });
                              }}
                              className={`
                inline-flex items-center gap-2
                px-4 py-2 rounded-xl text-xs font-bold
                bg-white border border-blue-200 text-blue-600
                hover:bg-blue-600 hover:text-blue
                transition-all
              `}
                            >
                              <ClipboardDocumentIcon className="w-4 h-4" />
                              کپی لینک QR
                            </button>

                            <a
                              href={product.QRDatas.config.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`
                inline-flex items-center gap-2
                px-4 py-2 rounded-xl text-xs font-bold
                bg-blue-600 text-white
                hover:bg-blue-700 transition-all
              `}
                            >
                              مشاهده لینک
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= مشخصات داینامیک ================= */}
                    {product?.specs &&
                      Object.entries(product.specs).map(([key, value]: any) => (
                        <SpecRow key={key} label={key} value={value} />
                      ))}
                  </div>
                )}


                {activeTab === 'reviews' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-center p-8 bg-gray-50 rounded-[2rem]">
                      <div className="text-5xl font-black text-gray-900">{product.reviews}</div>
                      <div className="flex justify-center my-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => <StarIconSolid key={i} className="w-5 h-5" />)}
                      </div>
                      <p className="text-xs text-gray-400 font-bold">امتیاز کلی محصول</p>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <RatingBar label="کیفیت ساخت" percent="85%" />
                      <RatingBar label="ارزش خرید" percent="92%" />
                      <RatingBar label="نوآوری" percent="70%" />
                      <button className="mt-4 w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all">
                        شما هم دیدگاه خود را ثبت کنید
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal (برای نمایش بزرگ تصاویر) */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 transition-all">
          <button onClick={() => setLightbox(false)} className="absolute  bg-red  top-35  right-6 text-white hover:rotate-90 transition-all">
            <XMarkIcon className="w-10 h-10" />
          </button>
          <div className="max-w-5xl w-full h-full flex items-center justify-center">
            <img src={productImages[activeIndex]} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Full view" />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {productImages.map((_: any, i: number) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </div>
      )}

      {/* نوار چسبان خرید موبایل (از کد شما) */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 transition-transform duration-500 md:hidden ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">قیمت نهایی</span>
            <span className="font-black text-blue-600">
              {formatPrice(product.hasDiscount ? product.discountedPrice : product.price)} <span className="text-[10px]">تومان</span>
            </span>
          </div>
          <button className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
            <ShoppingBagIcon className="w-5 h-5" /> افزودن به سبد
          </button>
        </div>
      </div>

      <style jsx global>{`
        .thumbs-swiper .swiper-slide-thumb-active div {
          border-color: #2563eb !important;
          background: #eff6ff;
          transform: scale(0.95);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .font-euclid { font-family: 'Euclid Circular A', 'Vazirmatn', sans-serif; }
      `}</style>
    </div>
  );
};

// کامپوننت‌های کمکی کوچک (Helper Components)
const SpecRow = ({ label, value, isMono = false, isGreen = false }: any) => (
  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <span className={`font-bold text-sm ${isMono ? 'font-mono' : ''} ${isGreen ? 'text-green-600' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const RatingBar = ({ label, percent }: { label: string, percent: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-bold text-gray-500">
      <span>{label}</span>
      <span>{percent}</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: percent }}></div>
    </div>
  </div>
);

export default ProductDetails;