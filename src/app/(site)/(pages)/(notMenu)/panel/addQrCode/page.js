"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

/* آیکن‌های Heroicons برای زیبایی UI/UX */
import {
  ClipboardIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  QrCodeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

/* تاریخ‌پیکر: استفاده برای انتخاب تاریخ (نمایش شمسی) */
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

/* ابزار: تاریخ شمسی با اعداد لاتین به فرم "YYYY/MM/DD" */
function getJalaliLatinDate(date = new Date()) {
  try {
    const fmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value || "";
    const m = parts.find((p) => p.type === "month")?.value || "";
    const d = parts.find((p) => p.type === "day")?.value || "";
    return `${y}/${m}/${d}`;
  } catch {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}

/* ابزار: تولید شناسه یونیک برای QRDatas */
function makeQrId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `qr_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export default function QrCodeCreator() {
  // استیت‌های QR
  const [value, setValue] = useState("https://example.com");
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState("M");
  const [size, setSize] = useState(200);
  const qrContainerRef = useRef(null);

  // مودال انتخاب محصول + لیست محصولات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState(null);

  // تاریخ ثبت QR
  const [useToday, setUseToday] = useState(true);
  const [manualDate, setManualDate] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const qrValue = useMemo(() => (value?.trim() ? value : " "), [value]);

  // مدیریت اسکرول بادی هنگام باز شدن مودال
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = "auto"; };
    }
  }, [isModalOpen]);

  // ریست کلی تنظیمات
  const reset = () => {
    setValue("https://example.com");
    setFgColor("#111827");
    setBgColor("#ffffff");
    setLevel("M");
    setSize(200);
    showToast("تنظیمات بازنشانی شد 🔄");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast("متن/لینک کپی شد ✅");
    } catch {
      showToast("کپی کردن ناموفق بود ❌", "error");
    }
  };

  // دانلود SVG با رعایت سایز
  const downloadSvg = (filename = "qr.svg") => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // دانلود PNG با ابعاد دقیق انتخاب شده توسط کاربر
  const downloadPng = (filename = "qr.png") => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const img = new Image();
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // استفاده از سایز دقیق انتخاب شده توسط کاربر
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);
      
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // دریافت محصولات
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setLoadError("");
      try {
        const res = await fetch(`${BASE_URL}${PRODUCTS_URL}`);
        if (!res.ok) throw new Error("خطا در دریافت لیست محصولات");
        const data = await res.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setLoadError(e.message || "خطا در دریافت لیست محصولات");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isModalOpen]);

  // فیلتر جستجوی محصولات
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => 
      String(p.title || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  // اتصال QR به محصول (PATCH)
  const attachQrToProduct = async (product) => {
    if (!value?.trim()) {
      showToast("لطفاً مقدار QR را وارد کنید", "error");
      return;
    }
    setSavingId(product._id);
    try {
      const chosenDate = useToday
        ? new Date()
        : (manualDate?.toDate?.() ? manualDate.toDate() : (manualDate || new Date()));

      const jalaliLatin = getJalaliLatinDate(chosenDate);

      const config = {
        v: 1,
        value: qrValue,
        ecc: level,
        colors: { fg: fgColor, bg: bgColor },
        size,
      };

      const newQrData = {
        id: product?.QRDatas?.id || makeQrId(),
        name: product?.title || "QRCode",
        config,
        dateAddQrCode: jalaliLatin,
      };

      const formData = new FormData();
      formData.append("QRDatas", JSON.stringify(newQrData));

      const res = await fetch(`${BASE_URL}${PRODUCTS_URL}/${product._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error("ذخیره‌سازی ناموفق بود");

      setProducts((prev) =>
        prev.map((p) =>
          String(p._id) === String(product._id) ? { ...p, QRDatas: newQrData } : p
        )
      );
      showToast("کیوآرکد با موفقیت ذخیره شد ✅");
    } catch (e) {
      showToast(e.message || "خطا در ذخیره سازی ❌", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div dir="rtl" className="bg-white min-h-screen p-4 sm:p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-lg text-white font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "error" ? "bg-red" : "bg-blue-light"
        }`}>
          {toast.text}
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-6xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
          <QrCodeIcon className="w-8 h-8 text-blue-light" />
          <h1 className="text-xl font-black text-gray-800">ایجاد و مدیریت کیوآرکد محصولات</h1>
        </div>

        <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Settings Section */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">لینک یا متن محتوا</label>
              <div className="relative">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 pr-12 focus:bg-white focus:ring-2 focus:ring-blue-light focus:border-blue-light  outline-none transition-all"
                  placeholder="https://example.com"
                />
                <ClipboardIcon className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">رنگ کد</label>
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-12 rounded-xl border-none p-1 cursor-pointer bg-gray-100" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">پس‌زمینه</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-12 rounded-xl border-none p-1 cursor-pointer bg-gray-100" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">دقت (ECC)</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border-none px-2 text-sm outline-none focus:ring-2 focus:ring-blue-light">
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">سایز (px)</label>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-12 rounded-xl bg-gray-50 border-none px-3 text-sm outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-50">
              <button onClick={copyToClipboard} className="flex-1 min-w-[120px] py-3 px-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <ClipboardIcon className="w-5 h-5" /> کپی متن
              </button>
              <button onClick={() => downloadSvg()} className="flex-1 min-w-[120px] py-3 px-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5" /> SVG
              </button>
              <button onClick={() => downloadPng()} className="flex-1 min-w-[120px] py-3 px-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5" /> PNG
              </button>
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto py-3 px-8 bg-blue-light rounded-2xl font-black text-white hover:bg-blue-dark shadow-lg shadow-blue-light/30 flex items-center justify-center gap-2 transition-all active:scale-95">
                <PlusIcon className="w-6 h-6" /> اتصال به محصول
              </button>
              <button onClick={reset} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all" title="ریست تنظیمات">
                <ArrowPathIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[320px] aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 relative group">
              <div 
                ref={qrContainerRef} 
                className="bg-white p-4 rounded-3xl shadow-2xl transition-all duration-300 group-hover:scale-105"
                style={{ width: 'fit-content' }}
              >
                <QRCode
                  value={qrValue}
                  size={size > 260 ? 260 : size} // نمایش در مانیتور محدود است اما دانلود دقیق است
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level={level}
                />
              </div>
              <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest italic">Live Preview</p>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 text-center max-w-[280px]">
              توجه: پیش‌نمایش در این کادر حداکثر ۲۶۰ پیکسل است، اما فایل دانلودی یا متصل شده با سایز اصلی ({size}px) خواهد بود.
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Product List */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <QrCodeIcon className="w-6 h-6 text-blue-light" /> انتخاب محصول
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Search and Date */}
            <div className="p-6 bg-gray-50/50 space-y-4 border-b">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو در بین نام محصولات..."
                  className="w-full bg-white rounded-2xl border-none p-4 pr-12 shadow-sm focus:ring-2 focus:ring-blue-light outline-none"
                />
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">تاریخ ثبت:</span>
                  <span className="text-xs font-black text-blue-light">
                    {getJalaliLatinDate(useToday ? new Date() : (manualDate?.toDate?.() ? manualDate.toDate() : manualDate || new Date()))}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-6 cursor-pointer flex items-center gap-2">
                    <input type="checkbox" checked={!useToday} onChange={(e) => setUseToday(!e.target.checked)} className="w-4 h-4 rounded text-blue-light focus:ring-blue-light" />
                    تاریخ دستی
                  </label>
                  {!useToday && (
                    <DatePicker
                      value={manualDate}
                      onChange={setManualDate}
                      calendar={persian}
                      locale={persian_fa}
                      inputClass="w-32 rounded-lg border-none bg-white shadow-sm text-xs p-2 focus:ring-2 focus:ring-blue-light"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
              {loadingProducts ? (
                /* Skeleton Screens */
                [...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse flex items-center p-4 gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-2 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : loadError ? (
                <div className="text-center py-10 text-red-500 font-bold">{loadError}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-400">محصولی پیدا نشد</div>
              ) : (
                filteredProducts.map((p) => {
                  const hasQR = !!p.QRDatas;
                  const thumb = p?.imgs?.thumbnails?.[0] || "https://via.placeholder.com/80";
                  return (
                    <button
                      key={p._id}
                      onClick={() => attachQrToProduct(p)}
                      disabled={savingId === p._id}
                      className={`w-full group text-right flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                        hasQR ? "bg-blue-light/10 border-blue-light/30" : "bg-white border-gray-100 hover:border-blue-light hover:shadow-lg hover:shadow-blue-light/20"
                      }`}
                    >
                      <img src={thumb} className="w-14 h-14 rounded-xl object-cover border bg-white" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800 truncate text-sm">{p.title}</h4>
                          {hasQR && (
                            <span className="text-[10px] bg-blue-light text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" /> متصل
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {hasQR ? `بروزرسانی: ${p.QRDatas.dateAddQrCode}` : "بدون کیوآرکد"}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${
                        hasQR ? "text-blue-light bg-white border border-blue-light/30 group-hover:bg-blue-light/10" : "bg-blue-light text-white group-hover:bg-blue-dark"
                      }`}>
                        {savingId === p._id ? (
                           <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" />
                        ) : hasQR ? (
                          <div className="flex items-center gap-1"><PencilSquareIcon className="w-4 h-4" /> ویرایش</div>
                        ) : (
                          <div className="flex items-center gap-1"><PlusIcon className="w-4 h-4" /> افزودن</div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t text-center">
              <button onClick={() => setIsModalOpen(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">بستن پنجره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}