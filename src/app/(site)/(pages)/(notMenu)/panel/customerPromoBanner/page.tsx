"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

// ============================================
// تایپ‌ها
// ============================================
type Product = {
  _id: string | number;
  title: string;
  count: number;
  reviews: number;
  price: number;
  hasDiscount: boolean;
  discountedPrice: number;
  categorie: string;
  date: string;
  imgs: { thumbnails: string[]; previews: string[] };
};

type Banner = {
  _id?: string | number;        
  title: string;
  subtitle: string;
  description: string;
  // descriptionBenner : string
  buttonText: string;
  buttonLink: string;
  image: string;
  bgColor: string;
  buttonColor: "blue" | "teal" | "orange";
};

// ============================================
// تنظیمات
// ============================================

const MAX_BANNERS = 3;
// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const CUSTOM_PROMO_BENNER_URL = process.env.NEXT_PUBLIC_API_CUSTOM_PROMO_BENNER_URL;
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

// رنگ‌های پیشنهادی بک‌گراند برای UI راحت‌تر
const BG_COLOR_PRESETS = ["#F5F5F7", "#DBF4F3", "#FFECE1"] as const;
const BUTTON_COLORS: Banner["buttonColor"][] = ["blue", "teal", "orange"];

// ============================================
// کمک‌ها
// ============================================

// محاسبه درصد تخفیف از محصول
const getDiscountPercent = (p: Product) => {
  if (!p?.hasDiscount || !p?.price) return 0;
  const raw = Math.round(100 - (p.discountedPrice / p.price) * 100);
  return Math.max(0, raw);
};

// ساخت اولیه بنر از محصول انتخاب‌شده
const buildBannerFromProduct = (p: Product): Banner => {
  const percent = getDiscountPercent(p);
  const subtitle =
    percent > 0 ? `تا ${percent}٪ تخفیف` : "پیشنهاد ویژه مشتری";
  const image =
    p?.imgs?.previews?.[0] ||
    p?.imgs?.thumbnails?.[0] ||
    "/images/promo/promo-01.png";
  return {
    title: p.title,
    subtitle,
    description:
      "محصول منتخب مشتری برای فروش. فرصت را از دست ندهید!",
    buttonText: "مشاهده و خرید",
    buttonLink: `shop-details/${p._id}`, // تغییر مسیر به shop-details
    image,
    bgColor: BG_COLOR_PRESETS[0],
    buttonColor: "blue",
  };
};

// تعیین نوع بنر بر اساس ایندکس
const getBannerTypeLabel = (index: number) => {
  switch (index) {
    case 0:
      return "بنر بزرگ";
    case 1:
      return "بنر کوچک اول";
    case 2:
      return "بنر کوچک دوم";
    default:
      return `بنر ${index + 1}`;
  }
};

// پیام‌های سریع SweetAlert
const toast = (title: string, icon: "success" | "error" | "warning" | "info") =>
  Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1600,
    timerProgressBar: true,
  });

// ============================================
// فرم افزودن/ویرایش بنر
// ============================================
type BannerFormProps = {
  initial?: Banner | null;            
  onCancel: () => void;
  onSubmit: (data: Banner) => void;   
  currentBannerCount: number;         // تعداد بنرهای فعلی
  editingIndex?: number;               // ایندکس بنری که در حال ویرایش است
};

const BannerForm: React.FC<BannerFormProps> = ({ 
  initial, 
  onCancel, 
  onSubmit, 
  currentBannerCount,
  editingIndex 
}) => {
  // state های فرم
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [buttonText, setButtonText] = useState(initial?.buttonText || "مشاهده و خرید");
  const [buttonLink, setButtonLink] = useState(initial?.buttonLink || "shop-details/1");
  const [image, setImage] = useState(initial?.image || "/images/promo/promo-01.png");
  const [bgColor, setBgColor] = useState<string>(initial?.bgColor || BG_COLOR_PRESETS[0]);
  const [buttonColor, setButtonColor] = useState<Banner["buttonColor"]>(initial?.buttonColor || "blue");

  // محصولات برای انتخاب سریع
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [query, setQuery] = useState("");

  // تعیین نوع بنری که در حال افزودن/ویرایش است
  const bannerType = useMemo(() => {
    if (initial && editingIndex !== undefined) {
      return getBannerTypeLabel(editingIndex);
    }
    // برای بنر جدید، بر اساس تعداد فعلی
    return getBannerTypeLabel(currentBannerCount);
  }, [initial, editingIndex, currentBannerCount]);

  // رنگ پیشنهادی برای هر نوع بنر
  useEffect(() => {
    // اگر در حال ویرایش نیستیم، رنگ‌های پیشنهادی را ست کنیم
    if (!initial) {
      const index = currentBannerCount;
      setBgColor(BG_COLOR_PRESETS[index] || BG_COLOR_PRESETS[0]);
      setButtonColor(BUTTON_COLORS[index] || "blue");
    }
  }, [initial, currentBannerCount]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProdLoading(true);
        const res = await fetch(`${BASE_URL}${PRODUCTS_URL}`);
        const data = await res.json();
        if (Array.isArray(data.data)) setProducts(data.data);
      } catch (e) {
        // اگر خطا، چیزی نمایش ندهیم اما فرم دستی فعال بماند
      } finally {
        setProdLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // فیلتر ساده محصولات بر اساس عنوان یا _id
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 15);
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        String(p._id).toLowerCase().includes(q)
    ).slice(0, 15);
  }, [products, query]);

  // انتخاب محصول و پر کردن خودکار فیلدها
  const handlePickProduct = (p: Product) => {
    const b = buildBannerFromProduct(p);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setDescription(b.description);
    setButtonText(b.buttonText);
    setButtonLink(b.buttonLink);
    setImage(b.image);
    // رنگ‌ها را دستکاری نکنیم تا ادمین بتواند انتخاب کند
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // اعتبارسنجی ساده
    if (!title.trim()) return toast("عنوان را وارد کنید", "warning");
    if (!subtitle.trim()) return toast("عنوان فرعی (ساب‌تایتل) را وارد کنید", "warning");
    if (!buttonText.trim()) return toast("متن دکمه را وارد کنید", "warning");
    if (!buttonLink.trim()) return toast("لینک دکمه را وارد کنید", "warning");
    if (!image.trim()) return toast("آدرس تصویر را وارد کنید", "warning");

    onSubmit({
      // ...(initial?._id ? { id_: initial._id } : {}),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      image: image.trim(),
      bgColor,
      buttonColor,
    });
  };

  return (
    // پنل شناور فرم (Drawer ساده)
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-[720px] h-full bg-white shadow-3 overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">
            {initial ? `ویرایش ${bannerType}` : `افزودن ${bannerType}`}
          </h3>
          
          {/* نمایش واضح نوع بنر */}
          <div className="mt-3 p-3 rounded-md bg-blue-light-5 border border-blue-light-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">در حال {initial ? 'ویرایش' : 'ایجاد'}:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold ${
                bannerType === "بنر بزرگ" 
                  ? "bg-blue text-white"
                  : bannerType === "بنر کوچک اول"
                  ? "bg-teal text-white"
                  : "bg-orange text-white"
              }`}>
                {bannerType}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {bannerType === "بنر بزرگ" 
                ? "این بنر در بالای صفحه با اندازه بزرگ نمایش داده می‌شود."
                : bannerType === "بنر کوچک اول"
                ? "این بنر در سمت چپ پایین صفحه نمایش داده می‌شود."
                : "این بنر در سمت راست پایین صفحه نمایش داده می‌شود."}
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            می‌توانید از لیست محصولات، داده‌ها را به‌صورت خودکار پر کنید و سپس جزئیات را ویرایش کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* انتخاب از محصولات */}
          <div>
            <label className="block mb-2 font-medium">انتخاب از محصولات (اختیاری)</label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="جستجو در محصولات (عنوان یا ID)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
                {/* لیست نتایج */}
                <div className="mt-2 max-h-56 overflow-auto border rounded-md">
                  {prodLoading ? (
                    <div className="p-3 text-sm text-gray-500">در حال بارگذاری...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">محصولی یافت نشد</div>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        type="button"
                        key={String(p._id)}
                        onClick={() => handlePickProduct(p)}
                        className="w-full px-3 py-2 text-right hover:bg-gray-50 border-b last:border-0"
                        title="کلیک برای پرکردن خودکار فرم"
                      >
                        <div className="font-medium text-sm">{p.title}</div>
                        <div className="text-xs text-gray-500">
                          ID: {String(p._id)} | 
                          قیمت: {p.price.toLocaleString("fa-IR")} تومان
                          {p.hasDiscount && (
                            <span className="text-green ml-1">
                              {' '}| تخفیف: {getDiscountPercent(p)}٪
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  نکته: با انتخاب محصول، لینک به صورت خودکار shop-details/{`{_id}`} تنظیم می‌شود.
                </p>
              </div>
            </div>
          </div>

          {/* فیلدهای اصلی بنر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">عنوان</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">ساب‌تایتل</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">توضیحات</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">متن دکمه</label>
                  <input
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">لینک دکمه</label>
                  <input
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue ltr"
                    placeholder="shop-details/1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    فرمت: shop-details/{`{product-_id}`}
                  </p>
                </div>
              </div>
            </div>

            {/* تصویر و رنگ‌ها */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">آدرس تصویر</label>
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue ltr"
                  placeholder="/images/promo/promo-01.png"
                />
                <div className="mt-3 rounded-md border p-3 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">پیش‌نمایش تصویر</div>
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={image || null}
                      alt="preview"
                      className="max-h-40 object-contain"
                      onError={(e: any) => (e.currentTarget.src = "/images/promo/promo-01.png")}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">رنگ پس‌زمینه</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border p-1"
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue ltr"
                    placeholder="#F5F5F7"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {BG_COLOR_PRESETS.map((c, idx) => (
                    <button
                      key={c}
                      type="button"
                      className={`h-8 w-8 rounded-md border-2 ${
                        bgColor === c ? 'border-blue' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c }}
                      title={`${c} (پیشنهادی برای ${getBannerTypeLabel(idx)})`}
                      onClick={() => setBgColor(c)}
                    />
                  ))}
                  <span className="text-xs text-gray-500">رنگ‌های پیشنهادی</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">رنگ دکمه</label>
                <div className="flex items-center gap-4">
                  {BUTTON_COLORS.map((c) => (
                    <label key={c} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="btnColor"
                        checked={buttonColor === c}
                        onChange={() => setButtonColor(c)}
                      />
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full ${
                          c === "blue" ? "bg-blue" : c === "teal" ? "bg-teal" : "bg-orange"
                        }`}
                      />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  پیشنهاد: برای {bannerType} از رنگ {
                    bannerType === "بنر بزرگ" ? "blue" :
                    bannerType === "بنر کوچک اول" ? "teal" : "orange"
                  } استفاده کنید.
                </p>
              </div>
            </div>
          </div>

          {/* دکمه‌های اکشن */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-blue text-white hover:bg-blue-dark"
            >
              {initial ? "ذخیره تغییرات" : `افزودن ${bannerType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// صفحه ادمین: لیست + CRUD
// ============================================
const CustomerPromoBannerAdmin: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);

  // دریافت لیست بنرها
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}${CUSTOM_PROMO_BENNER_URL}`);
      if (!res.ok) throw new Error("Fetch error");
      const data = await res.json();
      // فقط 3 تای اول
      setBanners(data.data);
    } catch (e) {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ایجاد بنر
  const createBanner = async (b: Banner) => {
    const res = await fetch(`${BASE_URL}${CUSTOM_PROMO_BENNER_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    if (!res.ok) throw new Error("Create failed");
    return res.json();
  };

  // ویرایش بنر
  const updateBanner = async (_id: string | number, b: Banner) => {
    const res = await fetch(`${BASE_URL}${CUSTOM_PROMO_BENNER_URL}/${_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  };

  // حذف بنر
  const deleteBanner = async (_id: string | number) => {
    const res = await fetch(`${BASE_URL}${CUSTOM_PROMO_BENNER_URL}/${_id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    return true;
  };

  // افزودن/ویرایش از طریق فرم
  const handleSubmitBanner = async (data: Banner) => {
    try {
      if (editing) {
        await updateBanner(editing._id!, data);
        toast("با موفقیت ویرایش شد", "success");
      } else {
        if (banners.length >= MAX_BANNERS) {
          return toast("حداکثر ۳ بنر قابل ثبت است", "warning");
        }
        await createBanner(data);
        toast("با موفقیت افزوده شد", "success");
      }
      setShowForm(false);
      setEditing(null);
      setEditingIndex(undefined);
      fetchBanners();
    } catch (e) {
      toast("خطایی رخ داد. دوباره تلاش کنید", "error");
    }
  };

  // حذف با تایید
  const handleDelete = async (b: Banner, index: number) => {
    const bannerType = getBannerTypeLabel(index);
    const confirm = await Swal.fire({
      title: `حذف ${bannerType}`,
      text: `آیا از حذف "${b.title}" مطمئن هستید؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteBanner(b._id!);
      toast("با موفقیت حذف شد", "success");
      fetchBanners();
    } catch (e) {
      toast("حذف ناموفق بود", "error");
    }
  };

  // دکمه افزودن
  const handleAddNew = () => {
    if (banners.length >= MAX_BANNERS) {
      return toast("حداکثر ۳ بنر قابل ثبت است", "warning");
    }
    setEditing(null);
    setEditingIndex(undefined);
    setShowForm(true);
  };

  // دکمه ویرایش
  const handleEdit = (b: Banner, index: number) => {
    setEditing(b);
    setEditingIndex(index);
    setShowForm(true);
  };

  return (
    <main className="max-h-screen overflow-y-auto bg-gray-50 py-8">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">مدیریت بنرهای مشتری (customerPromoBanner)</h1>
            <p className="text-sm text-gray-500 mt-1">
              تا ۳ بنر می‌توانید ثبت کنید: ۱ بنر بزرگ و ۲ بنر کوچک. ترتیب آرایه = ترتیب نمایش.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBanners}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
              title="بارگذاری مجدد"
            >
              <ArrowPathIcon className="h-5 w-5" />
              بروزرسانی
            </button>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue text-white hover:bg-blue-dark"
              title="افزودن بنر جدید"
            >
              <PlusIcon className="h-5 w-5" />
              افزودن {getBannerTypeLabel(banners.length)}
            </button>
          </div>
        </div>

        {/* وضعیت بارگذاری */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 rounded-lg bg-white shadow animate-pulse" />
            <div className="h-40 rounded-lg bg-white shadow animate-pulse" />
            <div className="h-40 rounded-lg bg-white shadow animate-pulse sm:col-span-2" />
          </div>
        ) : (
          <>
            {/* لیست بنرها */}
            {banners.length === 0 ? (
              <div className="rounded-lg bg-white shadow p-6 text-center text-gray-500">
                هنوز بنری ثبت نشده است. روی &quot;افزودن بنر بزرگ&quot; کلیک کنید.
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                {banners.map((b, idx) => (
                  <div key={String(b._id)} className="rounded-lg bg-white shadow p-5 flex flex-col">
                    {/* نشانگر جایگاه بنر */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold">
                        {idx === 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded bg-blue text-white">
                            بنر بزرگ
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded bg-teal text-white">
                            بنر کوچک اول
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded bg-orange text-white">
                            بنر کوچک دوم
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(b, idx)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border hover:bg-blue-light-2 hover:text-blue-dark"
                          title="ویرایش"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(b, idx)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border hover:bg-red-light-2 hover:text-red-dark text-red-600"
                          title="حذف"
                        >
                          <TrashIcon className="h-5 w-5" />
                          حذف
                        </button>
                      </div>
                    </div>

                    {/* پیش‌نمایش کوچک کارت */}
                    <div
                      className="rounded-md border p-4"
                      style={{ backgroundColor: b.bgColor || "#F5F5F7" }}
                    >
                      <div className="flex gap-4">
                        <img
                          src={b.image || null}
                          alt={b.title || null}
                          className="h-20 w-20 object-contain rounded bg-white/50"
                          onError={(e: any) => (e.currentTarget.src = "/images/promo/promo-01.png")}
                        />
                        <div className="flex-1 text-right">
                          <div className="font-bold">{b.title}</div>
                          <div className="text-sm text-gray-700">{b.subtitle}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</div>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-white text-xs ${
                                b.buttonColor === "blue"
                                  ? "bg-blue"
                                  : b.buttonColor === "teal"
                                  ? "bg-teal"
                                  : "bg-orange"
                              }`}
                            >
                              {b.buttonText}
                            </span>
                            <span className="text-xs text-gray-400 mr-2 ltr inline-block">{b.buttonLink}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      شناسه: {String(b._id)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* راهنمای بنرهای باقی‌مانده */}
            {banners.length > 0 && banners.length < MAX_BANNERS && (
              <div className="mt-6 rounded-md bg-blue-light-5 border border-blue-light-4 p-4 text-sm">
                <strong>بنرهای قابل افزودن:</strong>
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  {banners.length === 1 && (
                    <>
                      <li>بنر کوچک اول (سمت چپ پایین)</li>
                      <li>بنر کوچک دوم (سمت راست پایین)</li>
                    </>
                  )}
                  {banners.length === 2 && (
                    <li>بنر کوچک دوم (سمت راست پایین)</li>
                  )}
                </ul>
              </div>
            )}

            {/* پیش‌نمایش چیدمان */}
            {banners.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold mb-3">پیش‌نمایش چیدمان نهایی</h3>
                <section className="overflow-hidden py-6 rounded-lg border bg-gray-50">
                  <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                    {/* بنر بزرگ */}
                    {banners[0] && (
                      <div
                        className="relative z-1 overflow-hidden rounded-lg py-8 px-6 mb-5"
                        style={{ backgroundColor: banners[0].bgColor }}
                      >
                        <div className="max-w-[550px] w-full">
                          <span className="block font-medium text-xl text-dark mb-3">
                            {banners[0].title}
                          </span>
                          <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-3">
                            {banners[0].subtitle}
                          </h2>
                          <p>{banners[0].description}</p>
                          <a
                            href={banners[0].buttonLink}
                            className={`inline-flex font-medium text-custom-sm text-white py-[11px] px-9.5 rounded-md ease-out duration-200 mt-5 ${
                              banners[0].buttonColor === "blue"
                                ? "bg-blue hover:bg-blue-dark"
                                : banners[0].buttonColor === "teal"
                                ? "bg-teal hover:bg-teal-dark"
                                : "bg-orange hover:bg-orange-dark"
                            }`}
                          >
                            {banners[0].buttonText}
                          </a>
                        </div>
                        <img
                          src={banners[0].image || null}
                          alt={banners[0].title || null}
                          className="absolute bottom-0 left-4 lg:left-26 -z-1 h-40 object-contain"
                        />
                      </div>
                    )}

                    {/* دو بنر کوچک */}
                    <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                      {[banners[1], banners[2]].map(
                        (bn, i) =>
                          bn && (
                            <div
                              key={i}
                              className="relative z-1 overflow-hidden rounded-lg py-8 px-6"
                              style={{ backgroundColor: bn.bgColor }}
                            >
                              <img
                                src={bn.image || null}
                                alt={bn.title || null}
                                className={`absolute top-1/2 -translate-y-1/2 left-3 -z-1 ${
                                  i === 0 ? "h-36" : "h-32"
                                } object-contain`}
                              />
                              <div className="text-right">
                                <span className="block text-lg text-dark mb-1.5">
                                  {bn.title}
                                </span>
                                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                                  {bn.subtitle}
                                </h2>
                                <p className="max-w-[285px] text-custom-sm">
                                  {bn.description}
                                </p>
                                <a
                                  href={bn.buttonLink}
                                  className={`inline-flex font-medium text-custom-sm text-white py-2.5 px-8.5 rounded-md ease-out duration-200 mt-6 ${
                                    bn.buttonColor === "blue"
                                      ? "bg-blue hover:bg-blue-dark"
                                      : bn.buttonColor === "teal"
                                      ? "bg-teal hover:bg-teal-dark"
                                      : "bg-orange hover:bg-orange-dark"
                                  }`}
                                >
                                  {bn.buttonText}
                                </a>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}

        {/* فرم افزدن/ویرایش */}
        {showForm && (
          <BannerForm
            initial={editing}
            editingIndex={editingIndex}
            currentBannerCount={banners.length}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              setEditingIndex(undefined);
            }}
            onSubmit={handleSubmitBanner}
          />
        )}
      </div>
    </main>
  );
};

export default CustomerPromoBannerAdmin;