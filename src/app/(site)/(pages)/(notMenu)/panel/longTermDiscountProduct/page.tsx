"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import type { Value } from "react-multi-date-picker";
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";

// تایپ محصول (از /products)
type Product = {
  title: string;
  count: number;
  reviews: number;
  price: number;
  hasDiscount: boolean;
  discountedPrice: number;
  id: string | number;
  categorie: string;
  date: string;
  imgs: { thumbnails: string[]; previews: string[] };
  QRDatas?: any;
};

// تایپ تخفیف زمان‌دار (از /longTermDiscountProduct)
type LongTermDiscount = {
  id?: string | number;
  productId: string | number;
  startedAt: string; // ISO
  endsAt: string; // ISO
  description: string;
};

// ابزارهای کمکی
const valueToDate = (v: Value): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && "toDate" in v) return (v as DateObject).toDate();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const valueToISO = (v: Value): string | null => {
  const d = valueToDate(v);
  return d ? d.toISOString() : null;
};

const toFaDigits = (input: number | string) =>
  input.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
const padFa = (n: number) => toFaDigits(n.toString().padStart(2, "0"));
const moneyFa = (n: number) => `${n.toLocaleString("fa-IR")} تومان`;
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const DiscountCountdownAdmin: React.FC = () => {
  // استیت‌ها
  const [products, setProducts] = useState<Product[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<LongTermDiscount | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // فرم
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [startedAt, setStartedAt] = useState<Value>(null);
  const [endsAt, setEndsAt] = useState<Value>(null);
  const [description, setDescription] = useState<string>("");

  // UI
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  // شمارش معکوس برای کارت محصول فعال
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [expired, setExpired] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  // دریافت لیست محصولات
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products");
      if (!res.ok) throw new Error("products fetch error");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در دریافت محصولات",
        text: "لیست محصولات دریافت نشد.",
        confirmButtonText: "باشه",
      });
    }
  };

  // دریافت تخفیف فعال
  const fetchActiveDiscount = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:3001/longTermDiscountProduct");
      if (!res.ok) throw new Error("discount fetch error");
      const list: LongTermDiscount[] = await res.json();

      // چک: اگر بیش از یک مورد وجود داشت
      if (Array.isArray(list) && list.length > 1) {
        await Swal.fire({
          icon: "warning",
          title: "بیش از یک محصول فعال!",
          html: `<p class="text-body">تعداد ${list.length} محصول در تخفیف تایم‌دار یافت شد.</p><p class="text-red text-sm">فقط اولین مورد نمایش داده می‌شود. لطفاً موارد اضافی را حذف کنید.</p>`,
          confirmButtonText: "متوجه شدم",
        });
      }

      if (Array.isArray(list) && list.length > 0) {
        const discount = list[0];
        setActiveDiscount(discount);

        // دریافت خود محصول
        const pRes = await fetch(`http://localhost:3001/products/${discount.productId}`);
        if (pRes.ok) {
          const prod: Product = await pRes.json();
          setActiveProduct(prod);
        } else {
          setActiveProduct(null);
        }

        setIsEdit(false); // فرم در حالت خالی
        resetForm();
      } else {
        // هیچ محصولی نیست
        setActiveDiscount(null);
        setActiveProduct(null);
        setIsEdit(false);
        resetForm();
      }
    } catch (err) {
      setActiveDiscount(null);
      setActiveProduct(null);
      setIsEdit(false);
      resetForm();
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId("");
    setStartedAt(null);
    setEndsAt(null);
    setDescription("");
  };

  useEffect(() => {
    fetchProducts();
    fetchActiveDiscount();
  }, []);

  // شمارش معکوس برای کارت محصول فعال
  const calcTimeLeft = () => {
    if (!activeDiscount?.endsAt) return "invalid";
    const end = new Date(activeDiscount.endsAt).getTime();
    const diff = end - Date.now();

    if (isNaN(end)) {
      setExpired(true);
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return "invalid";
    }

    if (diff <= 0) {
      setExpired(true);
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return "done";
    }

    setExpired(false);
    setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((diff / (1000 * 60)) % 60));
    setSeconds(Math.floor((diff / 1000) % 60));
    return "ok";
  };

  useEffect(() => {
    if (!activeDiscount?.endsAt) return;
    calcTimeLeft();
    const t = setInterval(() => {
      const status = calcTimeLeft();
      if (status === "done" || status === "invalid") clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [activeDiscount?.endsAt]);

  // محصول انتخابی در فرم
  const selectedProduct = products.find((p) => String(p.id) === String(selectedProductId));

  // درصد تخفیف
  const selectedDiscountPercent = useMemo(() => {
    if (!selectedProduct?.hasDiscount || selectedProduct.price <= 0) return 0;
    return Math.max(
      0,
      Math.round(100 - (selectedProduct.discountedPrice / selectedProduct.price) * 100)
    );
  }, [selectedProduct]);

  const activeDiscountPercent = useMemo(() => {
    if (!activeProduct?.hasDiscount || activeProduct.price <= 0) return 0;
    return Math.max(
      0,
      Math.round(100 - (activeProduct.discountedPrice / activeProduct.price) * 100)
    );
  }, [activeProduct]);

  // پیشرفت زمان
  const timeProgress = useMemo(() => {
    if (!activeDiscount?.startedAt || !activeDiscount.endsAt) return 0;
    const s = new Date(activeDiscount.startedAt).getTime();
    const e = new Date(activeDiscount.endsAt).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    return clamp(((Date.now() - s) / (e - s)) * 100);
  }, [activeDiscount?.startedAt, activeDiscount?.endsAt]);

  // اعتبارسنجی فرم
  const canSubmit =
    !!selectedProductId &&
    !!valueToISO(startedAt) &&
    !!valueToISO(endsAt) &&
    description.trim().length >= 10;

  // افزودن
  const handleAdd = async () => {
    if (!canSubmit) {
      Swal.fire({
        icon: "warning",
        title: "فیلدهای الزامی",
        text: "لطفاً محصول، تاریخ‌ها و توضیحات (حداقل ۱۰ کاراکتر) را وارد کنید.",
        confirmButtonText: "باشه",
      });
      return;
    }

    // چک وجود محصول فعال
    if (activeDiscount) {
      const result = await Swal.fire({
        icon: "warning",
        title: "محصول فعال موجود است",
        html: `<p class="text-body mb-2">یک محصول تخفیف‌دار فعلاً ثبت شده است.</p><p class="text-dark-4">برای افزودن محصول جدید، ابتدا محصول فعلی را حذف کنید.</p>`,
        showCancelButton: true,
        confirmButtonColor: "#F23030",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "حذف و افزودن جدید",
        cancelButtonText: "انصراف",
      });

      if (!result.isConfirmed) return;

      // حذف محصول فعلی
      if (activeDiscount.id) {
        await fetch(`http://localhost:3001/longTermDiscountProduct/${activeDiscount.id}`, {
          method: "DELETE",
        });
      }
    }

    const startISO = valueToISO(startedAt)!;
    const endISO = valueToISO(endsAt)!;

    if (new Date(endISO) <= new Date(startISO)) {
      Swal.fire({
        icon: "error",
        title: "خطا در تاریخ",
        text: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
        confirmButtonText: "باشه",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: Omit<LongTermDiscount, "id"> = {
        productId: String(selectedProductId),
        startedAt: startISO,
        endsAt: endISO,
        description: description.trim(),
      };

      const res = await fetch("http://localhost:3001/longTermDiscountProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("post error");

      await Swal.fire({
        icon: "success",
        title: "ثبت شد",
        text: "محصول تخفیف تایم‌دار با موفقیت اضافه شد.",
        timer: 1600,
        showConfirmButton: false,
      });

      resetForm();
      setIsEdit(false);
      await fetchActiveDiscount();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "در ثبت محصول مشکلی رخ داد.",
        confirmButtonText: "باشه",
      });
    } finally {
      setLoading(false);
    }
  };

  // ویرایش
  const handleUpdate = async () => {
    if (!activeDiscount?.id) return;
    
    if (!canSubmit) {
      Swal.fire({
        icon: "warning",
        title: "فیلدهای الزامی",
        text: "لطفاً تمام فیلدها را کامل کنید.",
        confirmButtonText: "باشه",
      });
      return;
    }

    const startISO = valueToISO(startedAt)!;
    const endISO = valueToISO(endsAt)!;

    if (new Date(endISO) <= new Date(startISO)) {
      Swal.fire({
        icon: "error",
        title: "خطا در تاریخ",
        text: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
        confirmButtonText: "باشه",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: LongTermDiscount = {
        id: activeDiscount.id,
        productId: String(selectedProductId),
        startedAt: startISO,
        endsAt: endISO,
        description: description.trim(),
      };

      const res = await fetch(
        `http://localhost:3001/longTermDiscountProduct/${activeDiscount.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("put error");

      await Swal.fire({
        icon: "success",
        title: "ذخیره شد",
        text: "تغییرات با موفقیت ذخیره شد.",
        timer: 1400,
        showConfirmButton: false,
      });

      resetForm();
      setIsEdit(false);
      await fetchActiveDiscount();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "در ویرایش مشکلی رخ داد.",
        confirmButtonText: "باشه",
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف
  const handleDelete = async () => {
    if (!activeDiscount?.id) return;

    const c = await Swal.fire({
      title: "حذف محصول تخفیف‌دار؟",
      html: `<p class="text-body mb-2">این تخفیف تایم‌دار حذف خواهد شد.</p><p class="text-red text-sm">این عملیات قابل بازگشت نیست!</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F23030",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
    });

    if (!c.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/longTermDiscountProduct/${activeDiscount.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("delete error");

      await Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "محصول با موفقیت حذف گردید.",
        timer: 1200,
        showConfirmButton: false,
      });

      setActiveDiscount(null);
      setActiveProduct(null);
      resetForm();
      setIsEdit(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "در حذف مشکلی رخ داد.",
        confirmButtonText: "باشه",
      });
    } finally {
      setLoading(false);
    }
  };

  // ویرایش محصول فعال: پرکردن فرم
  const handleEditActive = () => {
    if (!activeDiscount) return;
    
    setSelectedProductId(String(activeDiscount.productId));
    setStartedAt(
      new DateObject({
        date: new Date(activeDiscount.startedAt),
        calendar: persian,
        locale: persian_fa,
      })
    );
    setEndsAt(
      new DateObject({
        date: new Date(activeDiscount.endsAt),
        calendar: persian,
        locale: persian_fa,
      })
    );
    setDescription(activeDiscount.description || "");
    setIsEdit(true);

    // اسکرول به فرم
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-1 py-10 lg:py-15" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* هدر */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div className="flex-1">
            <h1 className="text-heading-4 lg:text-heading-3 font-bold text-dark mb-3">
              مدیریت محصول تخفیف تایم‌دار
            </h1>
            <p className="text-body leading-relaxed max-w-[700px]">
              تنها یک محصول می‌تواند همزمان در تخفیف زمان‌دار باشد. اگر محصول فعالی وجود دارد،
              آن را در کارت زیر مشاهده کرده و در صورت نیاز ویرایش یا حذف کنید.
            </p>
          </div>
          <button
            onClick={() => {
              fetchProducts();
              fetchActiveDiscount();
            }}
            disabled={fetching}
            className="flex items-center gap-2 bg-white text-blue border-2 border-blue py-2.5 px-6 rounded-lg font-medium hover:bg-blue hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-1 hover:shadow-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${fetching ? "animate-spin" : ""}`} />
            بروزرسانی
          </button>
        </div>

        {/* کارت محصول فعال */}
        {fetching ? (
          <div className="bg-white shadow-2 rounded-xl p-8 mb-10">
            <div className="h-6 w-48 bg-gray-3 rounded mb-6 animate-pulse" />
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4">
                <div className="w-full aspect-square bg-gray-2 rounded-xl animate-pulse" />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="h-6 w-72 bg-gray-3 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-3 rounded animate-pulse" />
                <div className="h-4 w-80 bg-gray-3 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-3 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : activeDiscount && activeProduct ? (
          <div className="bg-gradient-to-br from-blue-light-5 to-blue-light-4 shadow-3 rounded-2xl p-6 lg:p-10 mb-10 relative overflow-hidden">
            
            {/* بج فعال */}
            <div className="absolute top-6 left-6 bg-green text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-2 z-10">
              <FireIcon className="w-5 h-5" />
              فعال
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* تصویر */}
              <div className="lg:col-span-4">
                <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden border-2 border-white shadow-2">
                  {activeProduct.imgs?.previews?.[0] ? (
                    <Image
                      src={activeProduct.imgs.previews[0] || null}
                      alt={activeProduct.title || null}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-5">
                      <PhotoIcon className="w-20 h-20" />
                    </div>
                  )}
                </div>
              </div>

              {/* اطلاعات */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* عنوان */}
                <div>
                  <h2 className="text-2xl lg:text-heading-5 font-bold text-dark mb-2">
                    {activeProduct.title}
                  </h2>
                  {activeDiscount.description && (
                    <p className="text-body leading-relaxed">{activeDiscount.description}</p>
                  )}
                </div>

                {/* قیمت */}
                <div className="flex items-center gap-4 flex-wrap">
                  {activeProduct.hasDiscount && activeDiscountPercent > 0 && (
                    <span className="inline-flex items-center justify-center bg-red text-white border-2 border-red-dark rounded-lg px-4 py-2 text-sm font-bold shadow-1">
                      {toFaDigits(activeDiscountPercent)}٪ تخفیف
                    </span>
                  )}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-dark">
                      {activeProduct.discountedPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-dark-4">تومان</span>
                  </div>
                  {activeProduct.hasDiscount && (
                    <span className="text-gray-5 line-through text-lg">
                      {activeProduct.price.toLocaleString("fa-IR")} تومان
                    </span>
                  )}
                </div>

                {/* شمارش معکوس */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="w-5.5 h-5.5 text-red" />
                    <h3 className="font-bold text-dark text-lg">زمان باقی‌مانده:</h3>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { value: days, label: "روز" },
                      { value: hours, label: "ساعت" },
                      { value: minutes, label: "دقیقه" },
                      { value: seconds, label: "ثانیه" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-2 p-3 text-center border-2 border-white">
                        <div className="text-2xl font-bold text-dark">{padFa(item.value)}</div>
                        <div className="text-xs text-body mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* نوار پیشرفت */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green via-yellow to-red transition-all duration-1000 rounded-full"
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-4 mt-2 text-center font-medium">
                    {toFaDigits(Math.round(100 - timeProgress))}٪ از زمان باقی مانده
                  </p>
                </div>

                {/* دکمه‌ها */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleEditActive}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-blue text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-dark transition-all duration-200 disabled:opacity-50 shadow-2 hover:shadow-3"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    ویرایش
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-red text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-red-dark transition-all duration-200 disabled:opacity-50 shadow-2 hover:shadow-3"
                  >
                    <TrashIcon className="w-5 h-5" />
                    حذف
                  </button>
                </div>

                {/* وضعیت */}
                <div className="flex items-center gap-3 pt-4 border-t-2 border-white/50">
                  {expired ? (
                    <>
                      <XCircleIcon className="w-6 h-6 text-red" />
                      <span className="text-red font-semibold">تخفیف منقضی شده</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-6 h-6 text-green" />
                      <span className="text-green font-semibold">در حال نمایش به کاربران</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* شیپ دکوری */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue/10 rounded-full blur-3xl -z-1" />
          </div>
        ) : (
          <div className="bg-yellow-light-4 border-r-4 border-yellow p-6 rounded-xl mb-10 flex items-start gap-4">
            <InformationCircleIcon className="w-7 h-7 text-yellow-dark flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-dark mb-2">هیچ محصول فعالی ثبت نشده</h3>
              <p className="text-dark-4 leading-relaxed">
                برای ساخت تخفیف زمان‌دار جدید، از فرم زیر یک محصول انتخاب کرده و بازه زمانی را
                مشخص کنید.
              </p>
            </div>
          </div>
        )}

        {/* فرم + پیش‌نمایش */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* فرم */}
          <div ref={formRef} className="lg:col-span-7">
            <div className="bg-white shadow-2 rounded-xl p-6 lg:p-8">
              
              {/* هدر فرم */}
              <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-3">
                {isEdit ? (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-blue-light-5 flex items-center justify-center">
                      <PencilSquareIcon className="w-6 h-6 text-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-dark">ویرایش محصول تخفیف‌دار</h2>
                      <p className="text-sm text-body mt-0.5">تغییرات موردنظر را ذخیره کنید</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-green-light-6 flex items-center justify-center">
                      <PlusIcon className="w-6 h-6 text-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-dark">افزودن محصول جدید</h2>
                      <p className="text-sm text-body mt-0.5">یک تخفیف زمان‌دار ایجاد کنید</p>
                    </div>
                  </>
                )}
              </div>

              {/* انتخاب محصول */}
              <div className="mb-7">
                <label className="flex items-center gap-2 text-dark font-semibold mb-3">
                  <TagIcon className="w-5 h-5 text-blue" />
                  انتخاب محصول <span className="text-red">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-3 bg-white py-3.5 px-4 outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all duration-200 text-dark font-medium"
                >
                  <option value="">— انتخاب کنید —</option>
                  {products.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.title} — {p.price.toLocaleString("fa-IR")} تومان
                    </option>
                  ))}
                </select>
              </div>

              {/* توضیحات */}
              <div className="mb-7">
                <label className="flex items-center gap-2 text-dark font-semibold mb-3">
                  <PhotoIcon className="w-5 h-5 text-blue" />
                  توضیحات کوتاه <span className="text-red">*</span>
                </label>
                <textarea
                  placeholder="مثال: این محصول با تخفیف ویژه تا پایان ماه در دسترس است. فرصت را از دست ندهید!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-lg border-2 border-gray-3 bg-white py-3.5 px-4 outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all duration-200 text-dark resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-body">حداکثر ۲۰۰ کاراکتر</p>
                  <p className="text-xs text-dark-4 font-medium">{description.length}/۲۰۰</p>
                </div>
              </div>

              {/* تاریخ شروع */}
              <div className="mb-7">
                <label className="flex items-center gap-2 text-dark font-semibold mb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-green" />
                  تاریخ و ساعت شروع <span className="text-red">*</span>
                </label>
                <DatePicker
                  value={startedAt}
                  onChange={setStartedAt}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD - HH:mm"
                  plugins={[<TimePicker position="bottom" key="time-start" />]}
                  calendarPosition="bottom-right"
                  placeholder="انتخاب تاریخ و زمان شروع"
                  containerClassName="w-full"
                  inputClass="w-full rounded-lg border-2 border-gray-3 bg-white py-3.5 px-4 outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all duration-200 text-dark font-medium"
                />
              </div>

              {/* تاریخ پایان */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-dark font-semibold mb-3">
                  <ClockIcon className="w-5 h-5 text-red" />
                  تاریخ و ساعت پایان <span className="text-red">*</span>
                </label>
                <DatePicker
                  value={endsAt}
                  onChange={setEndsAt}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD - HH:mm"
                  plugins={[<TimePicker position="bottom" key="time-end" />]}
                  calendarPosition="bottom-right"
                  placeholder="انتخاب تاریخ و زمان پایان"
                  containerClassName="w-full"
                  inputClass="w-full rounded-lg border-2 border-gray-3 bg-white py-3.5 px-4 outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all duration-200 text-dark font-medium"
                />
              </div>

              {/* دکمه‌ها */}
              <div className="flex flex-wrap gap-4 pt-5 border-t border-gray-3">
                {isEdit ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      disabled={loading || !canSubmit}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 bg-blue text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-1 hover:shadow-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        setIsEdit(false);
                      }}
                      disabled={loading}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 bg-gray-4 text-dark py-4 px-8 rounded-lg font-semibold hover:bg-gray-5 transition-all duration-200 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      انصراف
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAdd}
                    disabled={loading || !canSubmit}
                    className="w-full flex items-center justify-center gap-2.5 bg-green text-white py-4 px-8 rounded-lg font-semibold hover:bg-green-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-1 hover:shadow-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    {loading ? "در حال افزودن..." : "افزودن محصول"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* پیش‌نمایش */}
          <div className="lg:col-span-5">
            <div className="bg-white shadow-2 rounded-xl p-6 lg:p-8 lg:sticky lg:top-8">
              <h3 className="text-xl font-bold text-dark mb-6 pb-4 border-b border-gray-3 flex items-center gap-2">
                <PhotoIcon className="w-6 h-6 text-blue" />
                پیش‌نمایش محصول
              </h3>

              {selectedProduct ? (
                <div className="space-y-6">
                  
                  {/* تصویر */}
                  <div className="relative w-full aspect-square bg-gray-1 rounded-xl overflow-hidden border-2 border-gray-2">
                    {selectedProduct.imgs?.previews?.[0] ? (
                      <Image
                        src={selectedProduct.imgs.previews[0] || null}
                        alt={selectedProduct.title || null}
                        fill
                        className="object-contain p-6"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-5">
                        <PhotoIcon className="w-20 h-20" />
                      </div>
                    )}
                  </div>

                  {/* عنوان */}
                  <h4 className="text-lg font-bold text-dark leading-relaxed">
                    {selectedProduct.title}
                  </h4>

                  {/* قیمت */}
                  <div className="space-y-3">
                    {selectedProduct.hasDiscount && selectedDiscountPercent > 0 && (
                      <span className="inline-flex items-center justify-center bg-red-light-6 text-red-dark border-2 border-red-light-4 rounded-lg px-4 py-2 text-sm font-bold">
                        {toFaDigits(selectedDiscountPercent)}٪ تخفیف
                      </span>
                    )}
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-blue">
                        {selectedProduct.discountedPrice.toLocaleString("fa-IR")}
                      </span>
                      <span className="text-dark-4">تومان</span>
                    </div>
                    {selectedProduct.hasDiscount && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-5 line-through text-lg">
                          {selectedProduct.price.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-gray-5 text-sm">تومان</span>
                      </div>
                    )}
                  </div>

                  {/* توضیحات */}
                  {description && (
                    <div className="bg-blue-light-5 border-r-4 border-blue p-4 rounded-lg">
                      <p className="text-dark leading-relaxed text-sm">{description}</p>
                    </div>
                  )}

                  {/* بازه زمانی */}
                  {startedAt && endsAt && (
                    <div className="bg-gray-1 p-5 rounded-xl space-y-4 border border-gray-3">
                      <div className="flex items-start gap-3">
                        <CalendarDaysIcon className="w-5 h-5 text-green flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <strong className="text-dark block mb-1.5 font-semibold">شروع:</strong>
                          <span className="text-body text-sm leading-relaxed">
                            {valueToDate(startedAt)?.toLocaleDateString("fa-IR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            - ساعت{" "}
                            {valueToDate(startedAt)?.toLocaleTimeString("fa-IR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-3" />

                      <div className="flex items-start gap-3">
                        <ClockIcon className="w-5 h-5 text-red flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <strong className="text-dark block mb-1.5 font-semibold">پایان:</strong>
                          <span className="text-body text-sm leading-relaxed">
                            {valueToDate(endsAt)?.toLocaleDateString("fa-IR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            - ساعت{" "}
                            {valueToDate(endsAt)?.toLocaleTimeString("fa-IR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-5">
                  <PhotoIcon className="w-24 h-24 mb-5" />
                  <p className="text-lg font-medium text-dark-4">محصولی انتخاب نشده</p>
                  <p className="text-sm text-body mt-2">برای مشاهده پیش‌نمایش، محصول را انتخاب کنید</p>
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