"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  TagIcon,
  PhotoIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";

/**
 * ابزارهای کمکی
 */
const valueToDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && "toDate" in v) return v.toDate();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const valueToISO = (v) => {
  const d = valueToDate(v);
  return d ? d.toISOString() : null;
};

const toFaDigits = (input) =>
  input?.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]) || "۰";

const padFa = (n) => toFaDigits(n.toString().padStart(2, "0"));

const DiscountCountdownAdmin = () => {
  // --- استیت‌های اصلی ---
  const [products, setProducts] = useState([]); 
  const [activeDiscount, setActiveDiscount] = useState(null); 
  const [activeProduct, setActiveProduct] = useState(null); 

  // --- استیت‌های فرم ---
  const [selectedProductId, setSelectedProductId] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [description, setDescription] = useState("");

  // --- وضعیت UI ---
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const formRef = useRef(null);

  /**
   * ۱. دریافت لیست محصولات (آموزش: استفاده از ریسپانس دیتای سفارشی)
   */
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/products");
      const result = await res.json();
      setProducts(result.data || result); 
    } catch (err) {
      console.error("Error:", err);
    }
  };

  /**
   * ۲. دریافت تخفیف فعال
   */
  const fetchActiveDiscount = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:3000/api/limited-discount");
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        const discount = result.data[0];
        setActiveDiscount(discount);

        const foundProduct = products.find(p => String(p._id) === String(discount.productId));
        if (foundProduct) {
            setActiveProduct(foundProduct);
        } else {
            const pRes = await fetch(`http://localhost:3000/api/products/${discount.productId}`);
            const pData = await pRes.json();
            setActiveProduct(pData.data || pData);
        }
      } else {
        setActiveDiscount(null);
        setActiveProduct(null);
      }
    } catch (err) {
      setActiveDiscount(null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProducts();
    };
    init();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      fetchActiveDiscount();
    }
  }, [products.length]);

  /**
   * ۳. تایمر زنده
   */
  useEffect(() => {
    if (!activeDiscount?.endsAt) return;

    const timer = setInterval(() => {
      const end = new Date(activeDiscount.endsAt).getTime();
      const diff = end - Date.now();

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / (1000 * 60)) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDiscount?.endsAt]);

  /**
   * ۴. عملیات حذف و ثبت
   */
  const handleDelete = async (silent = false) => {
    if (!activeDiscount?._id) return;
    if (!silent) {
      const confirm = await Swal.fire({
        title: "حذف تخفیف؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F23030",
        confirmButtonText: "حذف شود",
        cancelButtonText: "انصراف",
      });
      if (!confirm.isConfirmed) return;
    }
    await fetch(`http://localhost:3000/api/limited-discount?id=${activeDiscount._id}`, { method: "DELETE" });
    if (!silent) {
      setActiveDiscount(null);
      setActiveProduct(null);
    }
  };

  const handleSave = async () => {
    const startISO = valueToISO(startedAt);
    const endISO = valueToISO(endsAt);
    if (!selectedProductId || !startISO || !endISO || description.length < 10) {
      Swal.fire("خطا", "فیلدها را کامل کنید", "warning");
      return;
    }
    setLoading(true);
    try {
      if (activeDiscount?._id) await handleDelete(true);
      const res = await fetch("http://localhost:3000/api/limited-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId, startedAt: startISO, endsAt: endISO, description }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "ثبت شد", timer: 1500 });
        setSelectedProductId("");
        setStartedAt(null);
        setEndsAt(null);
        setDescription("");
        fetchActiveDiscount();
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => String(p._id) === String(selectedProductId));

  return (
    // آموزش ریسپانسیو: استفاده از px-4 برای موبایل و sm:px-7.5 برای دسکتاپ
    <div className="min-h-screen bg-gray-1 py-10 px-4 sm:px-7.5 font-euclid-circular-a" dir="rtl">
      <div className="max-w-[1170px] mx-auto">
        
        {/* هدر: در موبایل وسط‌چین و در دسکتاپ بین‌چین */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
          <h1 className="text-heading-6 sm:text-heading-4 font-bold text-dark flex items-center gap-3 text-center sm:text-right">
            <ClockIcon className="w-8 h-8 text-blue" />
            مدیریت تخفیف زمان‌دار
          </h1>
          <button 
            onClick={fetchActiveDiscount}
            className="w-full sm:w-auto flex justify-center p-3 bg-white border border-gray-3 rounded-full hover:shadow-2 transition-all group"
          >
            <ArrowPathIcon className={`w-6 h-6 text-dark-3 group-hover:text-blue ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ۱. کارت فعال: آموزش ریسپانسیو: تبدیل از ستون به ردیف با md:flex-row */}
        {activeDiscount && activeProduct ? (
          <div className="bg-gradient-to-br from-blue-light-5 to-blue-light-4 rounded-xl shadow-3 p-5 sm:p-7.5 mb-12 relative overflow-hidden border border-blue-light-3">
            <div className="absolute top-0 left-0 bg-blue-dark text-white px-4 py-1.5 rounded-br-xl text-2xs font-bold flex items-center gap-2">
              <FireIcon className="w-4 h-4" /> فعال
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 lg:gap-10 items-center mt-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 relative bg-white rounded-xl p-3 shadow-1 shrink-0">
                <Image src={activeProduct.imgs?.previews?.[0] || "/placeholder.png"} alt="" fill className="object-contain" />
              </div>
              
              <div className="flex-1 text-center md:text-right space-y-3">
                <h2 className="text-custom-lg sm:text-heading-6 font-bold text-dark">{activeProduct.title}</h2>
                <p className="text-body text-custom-sm leading-relaxed line-clamp-2">{activeDiscount.description}</p>
                
                {/* تایمر ریسپانسیو: ۴ ستون در موبایل با grid */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-2">
                  {[
                    { label: "روز", val: timeLeft.d },
                    { label: "ساعت", val: timeLeft.h },
                    { label: "دقیقه", val: timeLeft.m },
                    { label: "ثانیه", val: timeLeft.s, red: true },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg py-2 text-center shadow-2 border border-white">
                      <span className={`block text-custom-lg sm:text-heading-6 font-bold ${item.red ? "text-red" : "text-dark"}`}>
                        {padFa(item.val)}
                      </span>
                      <span className="text-[10px] sm:text-2xs text-body font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleDelete()}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-light-6 text-red border border-red-light-4 px-6 py-3 rounded-lg hover:bg-red hover:text-white transition-all font-bold shadow-1"
              >
                <TrashIcon className="w-5 h-5" /> حذف
              </button>
            </div>
          </div>
        ) : !fetching && (
          <div className="bg-yellow-light-4 border-r-4 border-yellow p-5 rounded-xl mb-12 flex items-start gap-3 shadow-1">
            <InformationCircleIcon className="w-6 h-6 text-yellow-dark shrink-0" />
            <p className="text-dark-2 text-custom-sm font-medium">هیچ تخفیف فعالی ثبت نشده است.</p>
          </div>
        )}

        {/* ۲. فرم و پیش‌نمایش: آموزش ریسپانسیو: استفاده از grid-cols-1 در موبایل و lg:grid-cols-12 در دسکتاپ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* فرم */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-2 border border-gray-2 p-5 sm:p-8">
            <h3 className="text-custom-2xl font-bold text-dark mb-8 flex items-center gap-2 pb-4 border-b border-gray-2">
              <PlusIcon className="w-6 h-6 text-green" /> تنظیم تخفیف جدید
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-custom-sm font-bold text-dark-2 mb-2">انتخاب محصول:</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-gray-1 border border-gray-3 rounded-lg px-4 py-3 outline-none focus:border-blue transition-all text-dark font-medium"
                >
                  <option value="">محصول را انتخاب کنید...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-custom-sm font-bold text-dark-2 mb-2">توضیحات بنر:</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-1 border border-gray-3 rounded-lg px-4 py-3 h-24 outline-none focus:border-blue transition-all resize-none"
                />
              </div>

              {/* تاریخ‌ها: ریسپانسیو با grid-cols-1 در موبایل */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-custom-sm font-bold text-dark-2 mb-2">شروع جشنواره:</label>
                  <DatePicker
                    value={startedAt}
                    onChange={setStartedAt}
                    calendar={persian} locale={persian_fa} format="YYYY/MM/DD HH:mm"
                    plugins={[<TimePicker position="bottom" key="tp1" />]}
                    inputClass="w-full bg-gray-1 border border-gray-3 rounded-lg px-4 py-3 text-custom-sm"
                    containerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="block text-custom-sm font-bold text-dark-2 mb-2">پایان جشنواره:</label>
                  <DatePicker
                    value={endsAt}
                    onChange={setEndsAt}
                    calendar={persian} locale={persian_fa} format="YYYY/MM/DD HH:mm"
                    plugins={[<TimePicker position="bottom" key="tp2" />]}
                    inputClass="w-full bg-gray-1 border border-gray-3 rounded-lg px-4 py-3 text-custom-sm"
                    containerClassName="w-full"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave} disabled={loading}
                className="w-full bg-blue text-white py-4 rounded-lg font-bold text-custom-lg hover:bg-blue-dark shadow-2 transition-all disabled:opacity-50"
              >
                {loading ? "در حال ثبت..." : "فعال‌سازی تخفیف"}
              </button>
            </div>
          </div>

          {/* پیش‌نمایش */}
          <div className="lg:col-span-5">
            <div className="bg-meta rounded-xl p-6 border-2 border-dashed border-gray-4 sticky top-10">
              <p className="text-2xs font-black text-body mb-6 uppercase tracking-widest text-center lg:text-right">پیش‌نمایش زنده کارت</p>
              
              {selectedProduct ? (
                <div className="bg-white rounded-xl shadow-3 overflow-hidden border border-gray-2">
                  <div className="relative h-48 sm:h-56 w-full bg-white p-6">
                     <Image src={selectedProduct.imgs?.previews?.[0] || "/placeholder.png"} alt="" fill className="object-contain" />
                  </div>
                  <div className="p-6 space-y-3 border-t border-gray-1">
                    <h4 className="font-bold text-dark text-custom-lg line-clamp-1">{selectedProduct.title}</h4>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-5 line-through text-custom-sm">{selectedProduct.price.toLocaleString("fa-IR")}</span>
                      <span className="text-blue text-custom-2xl">{selectedProduct.discountedPrice.toLocaleString("fa-IR")} <small className="text-2xs text-body">تومان</small></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-gray-5 text-center bg-white/50 rounded-xl border border-white">
                  <PhotoIcon className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-custom-sm">محصولی انتخاب نشده است.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DiscountCountdownAdmin;