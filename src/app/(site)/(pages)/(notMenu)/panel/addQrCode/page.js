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
} from "@heroicons/react/24/outline";

/* تاریخ‌پیکر: استفاده اختیاری برای انتخاب تاریخ (نمایش شمسی) */
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

/*
  نکته: اگر API شما JSON Server هست، مسیرهای زیر کار می‌کنند:
  GET   http://localhost:3001/products
  PATCH http://localhost:3001/products/:id
*/
const API_BASE = "http://localhost:3001/products";

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
  return (typeof crypto !== "undefined" && crypto.randomUUID)
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

  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast("متن/لینک کپی شد ✅");
    } catch {
      showToast("کپی کردن ناموفق بود ❌", "error");
    }
  };

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

  // =========================================================================
  // شروع تغییرات: افزودن تابع ساخت پیش‌نمایش کم‌حجم
  // =========================================================================
  /**
   * از SVG رندر شده یک پیش‌نمایش کم‌حجم (WebP یا PNG) با ابعاد مشخص می‌سازد.
   * این تابع برای ذخیره‌سازی در دیتابیس ایده‌آل است.
   */
  const getQrPreviewDataUrl = ({ targetPx = 256, format = "webp", quality = 0.85 } = {}) =>
    new Promise((resolve, reject) => {
      const svg = qrContainerRef.current?.querySelector("svg");
      if (!svg) return resolve(null);

      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetPx;
        canvas.height = targetPx;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false; // برای حفظ شارپ بودن پیکسل‌ها

        // پس‌زمینه را با رنگ انتخابی پر می‌کنیم
        ctx.fillStyle = bgColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mime = format === "webp" ? "image/webp" : "image/png";
        let dataUrl = canvas.toDataURL(mime, quality);

        // Fallback به PNG اگر مرورگر WebP را پشتیبانی نکرد
        if (format === "webp" && !dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/png");
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  // =========================================================================
  // پایان تغییرات: افزودن تابع ساخت پیش‌نمایش کم‌حجم
  // =========================================================================

  // این تابع برای دکمه "دانلود PNG" حفظ شده و تصویر با کیفیت بالا تولید می‌کند
  const getQrPngDataUrl = (scale = 4) =>
    new Promise((resolve, reject) => {
      const svg = qrContainerRef.current?.querySelector("svg");
      if (!svg) return resolve(null);
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const img = new Image();
      const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bgColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        try {
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = url;
    });

  const downloadPng = (filename = "qr.png", scale = 4) => {
    getQrPngDataUrl(scale).then((dataUrl) => {
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    });
  };

  const reset = () => {
    setValue("https://example.com");
    setFgColor("#111827");
    setBgColor("#ffffff");
    setLevel("M");
    setSize(200);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setLoadError("");
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("خطا در دریافت لیست محصولات");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setLoadError(e.message || "خطا در دریافت لیست محصولات");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isModalOpen]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return products;
    return products.filter((p) => String(p.title || "").toLowerCase().includes(q.toLowerCase()));
  }, [products, query]);

  // =========================================================================
  // شروع تغییرات: بازنویسی کامل تابع ذخیره‌سازی
  // =========================================================================
  /**
   * این تابع QR فعلی را به یک محصول متصل می‌کند.
   * به جای ذخیره یک تصویر حجیم، یک آبجکت `config` (برای بازسازی QR) و یک
   * پیش‌نمایش `preview` کم‌حجم (WebP) را در دیتابیس ذخیره می‌کند.
   */
  const attachQrToProduct = async (product) => {
    if (!value?.trim()) {
      showToast("لطفاً مقدار QR را وارد کنید", "error");
      return;
    }

    setSavingId(product.id);
    try {
      const chosenDate =
        useToday
          ? new Date()
          : (manualDate?.toDate?.() ? manualDate.toDate() : (manualDate || new Date()));
      const jalaliLatin = getJalaliLatinDate(chosenDate);

      // 1. ساخت آبجکت کانفیگ برای ذخیره‌سازی اطلاعات اصلی QR
      const config = {
        v: 1, // نسخه کانفیگ برای سازگاری در آینده
        value: qrValue,
        ecc: level,
        colors: { fg: fgColor, bg: bgColor },
      };

      // 2. ساخت یک پیش‌نمایش کم‌حجم (اختیاری) برای نمایش در لیست‌ها
      const previewDataUrl = await getQrPreviewDataUrl({
        targetPx: 256,
        format: "webp",
        quality: 0.85,
      });

      // 3. ساخت آبجکت نهایی برای ارسال به API
      const newQrData = {
        id: product?.QRDatas?.id || makeQrId(),
        name: product?.title || "QRCode",
        config: config, // اطلاعات اصلی برای بازسازی QR
        preview: previewDataUrl
          ? {
              url: previewDataUrl,
              width: 256,
              height: 256,
              mime: previewDataUrl.startsWith("data:image/webp") ? "image/webp" : "image/png",
            }
          : undefined, // پیش‌نمایش کم‌حجم
        dateAddQrCode: jalaliLatin,
      };

      // 4. ارسال داده جدید به سرور
      const res = await fetch(`${API_BASE}/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ QRDatas: newQrData }),
      });

      if (!res.ok) throw new Error("ذخیره‌سازی ناموفق بود");

      // 5. به‌روزرسانی لیست محلی
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, QRDatas: newQrData } : p)));

      showToast("کیوآرکد با موفقیت روی محصول ذخیره شد ✅");
    } catch (e) {
      showToast(e.message || "ذخیره‌سازی ناموفق بود ❌", "error");
    } finally {
      setSavingId(null);
    }
  };
  // =========================================================================
  // پایان تغییرات: بازنویسی کامل تابع ذخیره‌سازی
  // =========================================================================

  return (
    <div dir="rtl" className="relative">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-lg shadow-md text-sm ${
            toast.type === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-blue-600" />
            ایجاد QRCode (react-qr-code)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3 lg:col-span-2">
            <div>
              <label className="text-sm text-gray-700">متن/لینک داخل QR</label>
              <div className="relative">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 px-3 pr-10"
                  placeholder="https://example.com"
                />
                <ClipboardIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-sm text-gray-700">رنگ QR</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">رنگ زمینه</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">ECC</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                >
                  <option value="L">L</option>
                  <option value="M">M</option>
                  <option value="Q">Q</option>
                  <option value="H">H</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">سایز (px)</label>
                <input
                  type="number"
                  min={100}
                  max={512}
                  value={size}
                  onChange={(e) => setSize(Math.min(512, Math.max(100, Number(e.target.value) || 200)))}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <ClipboardIcon className="w-5 h-5" />
                کپی متن/لینک
              </button>
              <button
                onClick={() => downloadSvg("qr.svg")}
                className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                دانلود SVG
              </button>
              <button
                onClick={() => downloadPng("qr.png")}
                className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                دانلود PNG
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-500 text-blue-600 px-3 py-2 hover:bg-blue-50"
              >
                <QrCodeIcon className="w-5 h-5" />
                افزودن این QR به محصول
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <ArrowPathIcon className="w-5 h-5" />
                ریست
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-3">پیش‌نمایش</h3>
              <div
                ref={qrContainerRef}
                className="bg-white rounded-lg p-3 flex items-center justify-center mx-auto"
                style={{ width: size + 24, height: size + 24 }}
              >
                <QRCode value={qrValue} size={size} bgColor={bgColor} fgColor={fgColor} level={level} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                برای چاپ باکیفیت، از SVG استفاده کنید. برای لوگو وسط یا استایل خاص، از qr-code-styling بهره بگیرید.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white w-full h-full md:h-auto md:max-h-[85vh] md:w-[95%] md:max-w-3xl rounded-none md:rounded-2xl shadow-xl flex flex-col"
          >
            <div className="sticky top-0 bg-white z-10 border-b px-4 sm:px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <QrCodeIcon className="w-6 h-6 text-blue-600" />
                انتخاب محصول برای افزودن کیوآرکد
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                aria-label="بستن"
                title="بستن"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 border-b bg-gray-50 space-y-3">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجوی محصول..."
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  تاریخ ثبت QR:{" "}
                  <span className="inline-flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    {getJalaliLatinDate(
                      useToday
                        ? new Date()
                        : (manualDate?.toDate?.() ? manualDate.toDate() : manualDate || new Date())
                    )}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!useToday}
                      onChange={(e) => setUseToday(!e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    انتخاب تاریخ دستی
                  </label>
                  {!useToday && (
                    <DatePicker
                      value={manualDate}
                      onChange={(val) => setManualDate(val)}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      calendarPosition="bottom-right"
                      className="rmdp-mobile w-full sm:w-auto"
                      inputClass="w-full sm:w-48 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm"
                      placeholder="انتخاب تاریخ"
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                روی یک آیتم کلیک کنید تا کیوآرکد فعلی به آن افزوده/بروزرسانی شود.
              </p>
            </div>
            <div className="p-3 sm:p-4 overflow-auto">
              {loadingProducts && (
                <ul className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <li key={i} className="border rounded-xl p-3 sm:p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {!!loadError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {loadError}
                </div>
              )}
              {!loadingProducts && !loadError && filtered.length === 0 && (
                <div className="py-10 text-center text-gray-500">
                  محصولی یافت نشد.
                </div>
              )}
              <ul className="space-y-3">
                {filtered.map((p) => {
                  const hasQR = !!p.QRDatas;
                  const thumb =
                    p?.imgs?.thumbnails?.[0] ||
                    p?.imgs?.previews?.[0] ||
                    "https://via.placeholder.com/64x64?text=No+Img";
                  return (
                    <li
                      key={p.id}
                      className={`group border rounded-xl hover:shadow-sm transition overflow-hidden ${
                        savingId === p.id ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <button
                        onClick={() => attachQrToProduct(p)}
                        className="w-full text-right"
                      >
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 sm:p-4">
                          <img
                            src={thumb || null}
                            alt={p.title}
                            className="w-14 h-14 object-contain bg-white border rounded-lg"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-gray-800 truncate">
                                {p.title}
                              </h4>
                              {hasQR && (
                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  کیوآرکد دارد
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                              <span>
                                قیمت:{" "}
                                {p.hasDiscount ? `${p.discountedPrice} (تخفیف)` : p.price}
                              </span>
                              {hasQR && p.QRDatas?.dateAddQrCode && (
                                <span className="text-blue-600">
                                  آخرین بروزرسانی QR: {p.QRDatas.dateAddQrCode}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="justify-self-end">
                            <span className={`text-sm px-3 py-1 rounded-lg border
                              ${hasQR
                                ? "text-blue-600 bg-blue-50 border-blue-200 group-hover:bg-blue-100"
                                : "text-emerald-700 bg-emerald-50 border-emerald-200 group-hover:bg-emerald-100"
                              }`}
                            >
                              {hasQR ? "بروزرسانی QR" : "افزودن QR"}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t p-3 sm:p-4 flex items-center justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}