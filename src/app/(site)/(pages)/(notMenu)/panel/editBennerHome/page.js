"use client";
// components/BannerSliderEditor.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const BannerSliderEditor = () => {
  /* ======================= State ======================= */
  const [bannerItems, setBannerItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingId, setAddingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // استیت برای ذخیره موقت توضیحات بنر قبل از ارسال
  const [tempDescriptions, setTempDescriptions] = useState({});

  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  /* ======================= Helpers ======================= */

  // فرمت قیمت
  const formatPrice = (num) => {
    if (num == null) return "-";
    return new Intl.NumberFormat("fa-IR").format(Number(num));
  };

  // گرفتن تصویر امن
  const getImageUrl = (item) =>
    item?.imgs?.previews?.[0] ||
    item?.preview ||
    item?.thumbnail ||
    item?.image ||
    "/images/notImg.png";

  const handleImageError = (e) => {
    e.target.src = "/images/notImg.png";
  };

  // مدیریت تغییر متن توضیح بنر
  const handleDescChange = (productId, value) => {
    setTempDescriptions((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  /* ======================= Fetch Data ======================= */

  // دریافت بنرها
  const fetchBannerData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/bennerHome");
      const data = await res.json();
      setBannerItems(data.data || []);
    } catch {
      Swal.fire("خطا", "دریافت بنر با مشکل مواجه شد", "error");
    } finally {
      setLoading(false);
    }
  };

  // دریافت محصولات
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/products");
      const data = await res.json();
      setProducts(data.data || []);
    } catch {
      Swal.fire("خطا", "دریافت محصولات با مشکل مواجه شد", "error");
    }
  };

  useEffect(() => {
    fetchBannerData();
    fetchProducts();
  }, []);

  /* ======================= Effects ======================= */

  // debounce سرچ
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // بستن dropdown با کلیک بیرون
  useEffect(() => {
    const handler = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ======================= Memo ======================= */

  // دسته‌بندی‌ها + تعداد
  const { categories, catCounts } = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const c = p?.categorie || "بدون دسته";
      counts[c] = (counts[c] || 0) + 1;
    });
    return {
      categories: ["all", ...Object.keys(counts)],
      catCounts: counts,
    };
  }, [products]);

  // محصولات موجود در بنر (برای جلوگیری از تکرار)
  const bannerIdSet = useMemo(
    () => new Set(bannerItems.map((b) => String(b.id))),
    [bannerItems]
  );

  // فیلتر محصولات
  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return products
      .filter(
        (p) => selectedCategory === "all" || p.categorie === selectedCategory
      )
      .filter((p) => !q || p.title?.toLowerCase().includes(q))
      .slice(0, 30);
  }, [products, selectedCategory, debouncedSearch]);

  /* ======================= Actions ======================= */

  // حذف بنر با _id
  const handleDelete = async (_id) => {
    const result = await Swal.fire({
      title: "حذف آیتم",
      text: "این آیتم از بنر حذف می‌شود",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F23030", // استفاده از رنگ قرمز کانفیگ
      confirmButtonText: "حذف",
      cancelButtonText: "لغو",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(_id);

      const res = await fetch(
        `http://localhost:3000/api/bennerHome/${_id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setBannerItems((prev) => prev.filter((i) => i._id !== _id));

      Swal.fire("موفق", "بنر حذف شد", "success");
    } catch {
      Swal.fire("خطا", "حذف بنر ناموفق بود", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // افزودن محصول به بنر
  const addProductToBanner = async (product) => {
    if (bannerIdSet.has(String(product.id))) {
      Swal.fire("تکراری", "این محصول قبلاً اضافه شده", "info");
      return;
    }

    try {
      setAddingId(product._id);

      // آماده سازی دیتا به همراه descriptionBenner
      const payload = {
        ...product,
        descriptionBenner: tempDescriptions[product._id] || "", 
      };

      const res = await fetch("http://localhost:3000/api/bennerHome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setBannerItems((prev) => [...prev, data.data]);
      
      // پاک کردن اینپوت بعد از موفقیت
      setTempDescriptions(prev => {
        const newState = {...prev};
        delete newState[product._id];
        return newState;
      });

      Swal.fire("موفق", "محصول به بنر اضافه شد", "success");
    } catch {
      Swal.fire("خطا", "افزودن محصول ناموفق بود", "error");
    } finally {
      setAddingId(null);
    }
  };

  /* ======================= Loading ======================= */
  if (loading) {
    return <div className="p-6 text-center">در حال بارگذاری...</div>;
  }

  /* ======================= UI ======================= */
  return (
    <div dir="rtl" className="p-4 md:p-6 bg-gray-1 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-dark">ویرایش بنر اصلی</h1>

        {/* ================== پنل افزودن ================== */}
        <div className="bg-white rounded-xl border border-gray-3 shadow-sm p-4 md:p-5 mb-6">

          {/* دسته‌بندی‌ها - ریسپانسیو اسکرول */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs md:text-sm whitespace-nowrap transition-all ${
                    active
                      ? "bg-blue text-white border-blue"
                      : "bg-white text-gray-6 border-gray-3 hover:border-blue"
                  }`}
                >
                  {cat === "all" ? "همه" : cat} ({cat === "all" ? products.length : catCounts[cat] || 0})
                </button>
              );
            })}
          </div>

          {/* سرچ و نتایج */}
          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="جستجوی محصول برای افزودن به بنر..."
                className="w-full border border-gray-3 rounded-lg py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-blue/20 outline-none transition-all"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-dark" />
                </button>
              )}
            </div>

            {/* دراپ‌داون نتایج */}
            {showResults && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-3 rounded-lg shadow-2 max-h-[400px] overflow-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">موردی یافت نشد</div>
                ) : (
                  filteredProducts.map((p) => {
                    const added = bannerIdSet.has(String(p.id));
                    return (
                      <div
                        key={p._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border-b border-gray-2 last:border-0 hover:bg-gray-1 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 w-full">
                          <img
                            src={getImageUrl(p)}
                            onError={handleImageError}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-2"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-dark text-sm md:text-base">{p.title}</div>
                            <div className="text-xs text-gray-5 text-left" dir="ltr">
                              {formatPrice(p.hasDiscount ? p.discountedPrice : p.price)} T
                            </div>
                          </div>
                        </div>

                        {/* بخش ورود توضیحات بنر */}
                        {!added && (
                          <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0">
                            <input 
                              type="text"
                              placeholder="توضیح کوتاه بنر..."
                              className="text-xs border border-gray-3 rounded-md px-2 py-1.5 w-full sm:w-40 focus:border-blue outline-none"
                              value={tempDescriptions[p._id] || ""}
                              onChange={(e) => handleDescChange(p._id, e.target.value)}
                            />
                            <button
                              onClick={() => addProductToBanner(p)}
                              disabled={addingId === p._id}
                              className="bg-blue-light-5 text-blue p-2 rounded-md hover:bg-blue hover:text-white transition-all disabled:opacity-50"
                              title="افزودن به لیست"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}

                        {added && (
                          <span className="text-xs font-medium text-green bg-green-light-6 px-2 py-1 rounded w-full sm:w-auto text-center">
                            در لیست موجود است
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================== لیست بنر (کارت‌ها) ================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {bannerItems.map((item) => (
            <div
              key={item._id}
              className="group relative bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden hover:shadow-2 transition-all"
            >
              {/* دکمه حذف - در موبایل همیشه قرمز، در دسکتاپ قرمز در حالت هوور */}
              <button
                onClick={() => handleDelete(item._id)}
                disabled={deletingId === item._id}
                className="absolute top-2 left-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red md:text-gray-4 md:hover:text-red lg:hover:scale-110 transition-all"
                title="حذف از بنر"
              >
                <TrashIcon className="w-5 h-5" />
              </button>

              <div className="aspect-video overflow-hidden">
                <img
                  src={getImageUrl(item)}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3 className="font-bold truncate text-dark mb-1">{item.title}</h3>
                
                {/* نمایش توضیحات بنر در صورت وجود */}
                {item.descriptionBenner && (
                  <p className="text-xs text-gray-6 mb-3 line-clamp-1 italic">
                    {item.descriptionBenner}
                  </p>
                )}

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-gray-5">قیمت نهایی:</span>
                  <div className="text-red font-bold text-sm">
                    {formatPrice(
                      item.hasDiscount ? item.discountedPrice : item.price
                    )} <span className="text-[10px] font-normal mr-1">تومان</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* حالت خالی */}
        {bannerItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-3">
            <p className="text-gray-5">هیچ محصولی در بنر اصلی قرار ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSliderEditor;