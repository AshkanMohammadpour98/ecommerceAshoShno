"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
// کتابخانه‌های تاریخ شمسی
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import QRCode from "react-qr-code";


export default function EditProductId({ params }) {
  const resolvedParams = use(params);
  const _id = resolvedParams._id; // 🟢 استفاده از _id برای واکشی دیتا طبق دستور قبلی شما
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCategory, setOriginalCategory] = useState("");

  const [formData, setFormData] = useState({
    id: "", // 🟡 حفظ id برای ارسال در بدنه (Payload)
    title: "",
    reviews: 0,
    price: 0,
    discountedPrice: 0,
    hasDiscount: false,
    categorie: "",
    date: "", // 🟢 فیلد تاریخ که از دیتابیس می‌آید
    imgs: { thumbnails: [], previews: [] },
    // 🔵 اصلاح شده: هر بخش ۲ جایگاه برای فایل جدید دارد
    files: { thumbnails: [null, null], previews: [null, null] },
    descriptionShort: "",
    descriptionFull: "",
    condition: "نو آکبند",
    // 🟢 QR Code
    QRDatas: null,     // کل آبجکت QR
    hasQR: false,      // آیا محصول QR دارد؟
    qrValue: "",       // مقدار value برای ویرایش

  });

  useEffect(() => {
    const fetchData = async () => {
      if (!_id) return;
      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(`${BASE_URL}${PRODUCTS_URL}/${_id}`),
          fetch(`${BASE_URL}${CATEGORYS_URL}`)
        ]);

        if (!productRes.ok) throw new Error("خطا در دریافت محصول");

        const productJson = await productRes.json();
        const categoryJson = await categoryRes.json();
        const actualData = productJson.data || productJson;

        // --- مپ کردن دیتای واقعی بر روی استیت فرم ---
        setFormData(prev => ({
          ...prev,
          ...actualData,
          id: actualData.id,
          date: actualData.date || "", // 🟢 دریافت تاریخ دقیق از دیتا (مثلاً 1404/11/16)
          imgs: {
            // 🔵 اصلاح شده: دقیقاً ۲ تصویر از دیتا گرفته می‌شود
            thumbnails: actualData.imgs?.thumbnails?.slice(0, 2) || [null, null],
            previews: actualData.imgs?.previews?.slice(0, 2) || [null, null],
          },
          files: { thumbnails: [null, null], previews: [null, null] },
          // 🟢 هندل کردن ساختار description: {short, full}
          descriptionShort: actualData.description?.short || "",
          descriptionFull: actualData.description?.full || "",
          // 🟢 QR Code mapping (خیلی مهم)
          QRDatas: actualData.QRDatas || null,
          hasQR: !!actualData.QRDatas,
          qrValue: actualData.QRDatas?.config?.value || "",

        }));

        setOriginalCategory(actualData.categorie);
        setCategories(categoryJson.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        Swal.fire("خطا", "محصول یافت نشد", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  // --- پاکسازی حافظه برای تصاویر موقت ---
  useEffect(() => {
    return () => {
      [...formData.files.thumbnails, ...formData.files.previews].forEach(file => {
        if (file) URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [formData.files]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => {
      const newFiles = { ...prev.files };
      newFiles[type][index] = file;
      return { ...prev, files: newFiles };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // 🟢 ولیدیشن UX: تخفیف نباید از قیمت اصلی بیشتر باشد
    if (formData.hasDiscount && Number(formData.discountedPrice) >= Number(formData.price)) {
      Swal.fire("خطای منطقی", "قیمت تخفیف نباید از قیمت اصلی بیشتر باشد", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("id", formData.id); // 🟡 ارسال id طبق دستور شما
      data.append("title", formData.title);
      data.append("price", formData.price);
      data.append("hasDiscount", formData.hasDiscount);
      data.append("discountedPrice", formData.hasDiscount ? formData.discountedPrice : 0);
      data.append("categorie", formData.categorie);
      data.append("descriptionShort", formData.descriptionShort);
      data.append("descriptionFull", formData.descriptionFull);
      data.append("condition", formData.condition);
      data.append("date", formData.date); // 🟢 ارسال همان تاریخ قبلی
      // 🟢 QR Code logic
      if (!formData.hasQR) {
        data.append("removeQR", "true");
      } else {
        data.append("qrValue", formData.qrValue);
      }

      // ارسال ۲ تصویر در صورت انتخاب فایل جدید
      formData.files.thumbnails.forEach((file, i) => { if (file) data.append(`thumb_${i}`, file); });
      formData.files.previews.forEach((file, i) => { if (file) data.append(`prev_${i}`, file); });

      const res = await fetch(`${BASE_URL}${PRODUCTS_URL}/${_id}`, {
        method: "PATCH",
        body: data,
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "تغییرات اعمال شد", timer: 1500, showConfirmButton: false });
        router.push("/panel/editProduct");
      }
    } catch (err) {
      Swal.fire("خطا", "ویرایش ناموفق", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // استایل‌های Tailwind بر اساس فایل کانفیگ شما
  const inputStyle = "w-full mt-1 border border-gray-3 rounded-xl px-4 py-3 outline-none focus:border-blue bg-gray-1 transition-all";

  if (loading) return <div className="text-center py-20 font-bold">درحال بارگذاری محصول...</div>;

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto bg-white shadow-2 rounded-2xl p-6 md:p-8 space-y-6 mb-20">
      <h2 className="text-xl font-bold text-dark border-b pb-4">ویرایش اطلاعات محصول</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-dark-2">عنوان محصول</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className="text-sm font-bold text-dark-2">دسته‌بندی</label>
          <select name="categorie" value={formData.categorie} onChange={handleChange} className={inputStyle}>
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-dark-2">وضعیت</label>
          <select name="condition" value={formData.condition} onChange={handleChange} className={inputStyle}>
            <option value="نو آکبند">نو آکبند</option>
            <option value="استوک">استوک</option>
            <option value="کارکرده">کارکرده</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-dark-2 mb-1 block">تاریخ ثبت (ثابت)</label>
          <DatePicker
            calendar={persian} locale={persian_fa}
            value={formData.date}
            onChange={(d) => setFormData(p => ({ ...p, date: d ? d.format("YYYY/MM/DD") : "" }))}
            inputClass={inputStyle} containerClassName="w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-dark-2">توضیح کوتاه</label>
          <input type="text" name="descriptionShort" value={formData.descriptionShort} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label className="text-sm font-bold text-dark-2">توضیحات کامل</label>
          <textarea name="descriptionFull" value={formData.descriptionFull} onChange={handleChange} className={`${inputStyle} min-h-[120px]`} rows={4} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-meta p-4 rounded-xl">
        <div>
          <label className="text-sm font-bold text-dark-2">قیمت (تومان)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputStyle} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={handleChange} className="w-5 h-5 accent-blue" />
          <span className="text-sm font-bold text-dark-2">تخفیف دارد؟</span>
        </div>
        {formData.hasDiscount && (
          <div>
            <label className="text-sm font-bold text-green">قیمت با تخفیف</label>
            <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} className={`${inputStyle} border-green`} />
          </div>
        )}
      </div>
      {/* 🟢 QR Code Section */}
<div className="space-y-4 bg-gray-1 border border-dashed border-gray-3 rounded-2xl p-6">
  <h3 className="text-sm font-bold text-dark italic border-r-4 border-green pr-3">
    مدیریت QR Code محصول
  </h3>

  {!formData.hasQR ? (
    <div className="text-center py-10 text-gray-400 font-bold">
      🚫 این محصول QR Code ندارد
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl p-6 shadow-sm">

      {/* 🔳 QR Preview */}
      <div className="flex flex-col items-center justify-center gap-4 border border-gray-3 rounded-xl p-4 bg-gray-1">
        <div className="bg-white p-4 rounded-xl shadow">
          <QRCode
            value={formData.qrValue}
            size={formData.QRDatas?.config?.size || 180}
            fgColor={formData.QRDatas?.config?.colors?.fg || "#000"}
            bgColor={formData.QRDatas?.config?.colors?.bg || "#fff"}
            level={formData.QRDatas?.config?.ecc || "M"}
          />
        </div>

        <span className="text-xs text-gray-500">
          تاریخ ایجاد: {formData.QRDatas?.dateAddQrCode}
        </span>
      </div>

      {/* ⚙️ QR Settings */}
      <div className="space-y-4">

        <div>
          <label className="text-sm font-bold text-dark-2">
            مقدار QR Code (Value)
          </label>
          <input
            type="text"
            value={formData.qrValue}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                qrValue: e.target.value,
              }))
            }
            className={inputStyle}
            placeholder="https://example.com"
          />
        </div>

        {/* 🔍 Config Info */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-1 rounded-xl p-4">
          <div>ECC: <b>{formData.QRDatas?.config?.ecc}</b></div>
          <div>Version: <b>{formData.QRDatas?.config?.v}</b></div>
          <div>Size: <b>{formData.QRDatas?.config?.size}px</b></div>
          <div>FG Color: <span className="inline-block w-4 h-4 rounded" style={{ background: formData.QRDatas?.config?.colors?.fg }} /></div>
        </div>

        {/* 🗑 Delete */}
        <button
          type="button"
          onClick={() => {
            Swal.fire({
              title: "حذف QR Code؟",
              text: "این عملیات قابل بازگشت نیست",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "حذف شود",
              cancelButtonText: "لغو",
            }).then(res => {
              if (res.isConfirmed) {
                setFormData(prev => ({
                  ...prev,
                  hasQR: false,
                  QRDatas: null,
                  qrValue: "",
                }));
              }
            });
          }}
          className="w-full py-3 rounded-xl bg-red-light text-white font-bold hover:bg-red transition"
        >
          🗑️ حذف QR Code
        </button>
      </div>
    </div>
  )}
</div>


      {/* 🟢 بخش مدیریت تصاویر اصلی (Previews) - ۲ عدد با استایل هماهنگ */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-dark italic border-r-4 border-blue pr-2">
          تصاویر اصلی (Previews)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="border-2 border-dashed border-gray-3 rounded-2xl p-4 bg-gray-1 flex flex-col items-center hover:border-blue transition-colors group">
              <div className="w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-white border shadow-sm mb-4">
                <img
                  src={formData.files.previews[i]
                    ? URL.createObjectURL(formData.files.previews[i])
                    : (formData.imgs.previews[i] ? `${BASE_URL}${formData.imgs.previews[i]}` : "https://placehold.co/400x400?text=No+Image")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={`preview-${i}`}
                />
              </div>
              <label className="w-full max-w-[240px]">
                <span className="block text-center text-xs font-bold py-2 bg-white border border-gray-3 rounded-lg cursor-pointer hover:bg-dark hover:text-white transition-all">
                  {formData.imgs.previews[i] ? "تغییر تصویر اصلی" : "انتخاب تصویر اصلی"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "previews", i)}
                  accept="image/*"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 بخش مدیریت تصاویر کوچک (Thumbnails) - کاملاً مشابه و هماهنگ با بخش بالا */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-dark italic border-r-4 border-orange-400 pr-2">
          تصاویر کوچک (Thumbnails)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="border-2 border-dashed border-gray-3 rounded-2xl p-4 bg-gray-1 flex flex-col items-center hover:border-orange-400 transition-colors group">
              <div className="w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-white border shadow-sm mb-4">
                <img
                  src={formData.files.thumbnails[i]
                    ? URL.createObjectURL(formData.files.thumbnails[i])
                    : (formData.imgs.thumbnails[i] ? `${BASE_URL}${formData.imgs.thumbnails[i]}` : "https://placehold.co/400x400?text=No+Thumb")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={`thumb-${i}`}
                />
              </div>
              <label className="w-full max-w-[240px]">
                <span className="block text-center text-xs font-bold py-2 bg-white border border-gray-3 rounded-lg cursor-pointer hover:bg-dark hover:text-white transition-all">
                  {formData.imgs.thumbnails[i] ? "تغییر بندانگشتی" : "انتخاب بندانگشتی"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "thumbnails", i)}
                  accept="image/*"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className={`w-full py-4 rounded-xl font-bold transition-all shadow-2 flex items-center justify-center gap-3 
          ${isSubmitting ? "bg-gray-400" : "bg-dark hover:bg-black text-white active:scale-95"}`}
      >
        {isSubmitting ? "در حال ثبت..." : "بروزرسانی نهایی محصول"}
      </button>
    </form>
  );
}