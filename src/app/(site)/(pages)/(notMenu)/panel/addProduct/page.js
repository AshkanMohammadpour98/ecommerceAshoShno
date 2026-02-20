"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    title: "",
    reviews: "",
    price: "",
    discountedPrice: "",
    hasDiscount: false,
    categorie: "",
    count: 1,
    date: "",
    condition: "نو آکبند", // 🟢 فیلد condition اضافه شد
    description: { short: "", full: "" }, // 🟢 content به description.short & description.full تبدیل شد
    imgs: { thumbnails: [null, null], previews: [null, null] },
  });

  // 🔵 استیت برای مدیریت خطاهای اینلاین (UI/UX)
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const [id] = useState(() => String(Date.now()));
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // URLs
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

  // 🟢 دریافت دسته‌بندی‌ها هنگام لود فرم
  useEffect(() => {
    fetch(`${BASE_URL}${CATEGORYS_URL}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  // 📌 تغییر فیلدهای فرم
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    // 🔵 حذف خطای فیلد هنگام تایپ کاربر (UI/UX)
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // 🟢 پشتیبانی از checkbox
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📌 تغییر description.short و description.full
  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    // 🔵 پاک کردن خطای توصیفات
    if (errors[`description.${name}`]) {
      setErrors((prev) => ({ ...prev, [`description.${name}`]: null }));
    }
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [name]: value },
    }));
  };

  // 📌 آپلود تصاویر
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      newImgs[type][index] = file; // ذخیره فایل واقعی
      return { ...prev, imgs: newImgs };
    });
  };

  // 🔵 تابع کمکی برای اسکرول به اولین خطا (UX)
  const scrollToError = (errorObj) => {
    const firstErrorKey = Object.keys(errorObj)[0];
    const element = document.getElementsByName(firstErrorKey)[0] || 
                    document.getElementById(firstErrorKey);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 📌 ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, price, reviews, categorie, imgs, date, description } = formData;
    
    // 🔵 ولیدیشن اینلاین و ساخت آبجکت خطاها
    let newErrors = {};
    if (!title) newErrors.title = "عنوان محصول الزامی است";
    if (!price) newErrors.price = "قیمت را وارد کنید";
    if (!reviews) newErrors.reviews = "امتیاز الزامی است";
    if (!categorie) newErrors.categorie = "دسته بندی را انتخاب کنید";
    if (!date) newErrors.date = "تاریخ را انتخاب کنید";
    if (!description.short) newErrors["description.short"] = "توضیح کوتاه الزامی است";
    if (!description.full) newErrors["description.full"] = "توضیح کامل الزامی است";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToError(newErrors); // 🔵 اسکرول خودکار به اولین خطا
      return;
    }

    if (
      imgs.thumbnails.some((img) => !img) ||
      imgs.previews.some((img) => !img)
    ) {
      Swal.fire({
        icon: "warning",
        title: "لطفا همه تصاویر محصول را انتخاب کنید",
      });
      return;
    }

    try {
      const form = new FormData();

      // 🟢 فیلدهای پایه
      form.append("id", id);
      form.append("title", formData.title);
      form.append("categorie", formData.categorie);
      form.append("date", formData.date);
      form.append("price", formData.price);
      form.append("reviews", formData.reviews);
      form.append("count", formData.count);
      form.append("hasDiscount", formData.hasDiscount);
      form.append(
        "discountedPrice",
        formData.hasDiscount ? formData.discountedPrice : ""
      );

      // 🟢 فیلدهای جدید
      form.append("condition", formData.condition);
      form.append("descriptionShort", formData.description.short);
      form.append("descriptionFull", formData.description.full);

      // 🟢 ارسال تصاویر
      formData.imgs.thumbnails.forEach((file) =>
        form.append("thumbnails", file)
      );
      formData.imgs.previews.forEach((file) => form.append("previews", file));

      // ذخیره محصول
      const resProduct = await fetch(`${BASE_URL}${PRODUCTS_URL}`, {
        method: "POST",
        body: form,
      });

      if (!resProduct.ok) throw new Error("افزودن محصول انجام نشد");

      // افزایش تعداد محصولات دسته‌بندی
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.categorie
      );
      if (selectedCategory) {
        await fetch(`${BASE_URL}${CATEGORYS_URL}/${selectedCategory._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: (selectedCategory.products ?? 0) + 1,
          }),
        });
      }

      await Swal.fire({
        icon: "success",
        title: "محصول با موفقیت اضافه شد!",
        showConfirmButton: false,
        timer: 1500,
      });

      // ریست فرم
      setFormData({
        title: "",
        reviews: "",
        price: "",
        discountedPrice: "",
        hasDiscount: false,
        categorie: "",
        count: 1,
        date: "",
        condition: "نو آکبند",
        description: { short: "", full: "" },
        imgs: { thumbnails: [null, null], previews: [null, null] },
      });

      router.push("/panel/editProduct");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطا!",
        text: error.message || "افزودن محصول انجام نشد",
      });
    }
  };

  // تبدیل اعداد فارسی به لاتین
  const faToEn = (str) => {
    return str.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
  };

  // 🔵 استایل مشترک برای Input ها جهت بهبود دید در بکگراند سفید
  const inputStyle = (fieldName) => `
    w-full mt-1.5 border rounded-xl px-4 py-3 transition-all duration-200
    ${errors[fieldName] ? 'border-red-light bg-red-light-6' : 'border-gray-3 bg-gray-1 focus:border-blue focus:bg-white'}
    focus:ring-2 focus:ring-blue/10 outline-none placeholder:text-gray-5
  `;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full mx-auto bg-white shadow-2 rounded-2xl p-4 md:p-8 space-y-8 mb-20 md:mb-0"
    >
      <div className="border-b border-gray-2 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark">
          افزودن محصول جدید
        </h2>
        <p className="text-custom-sm text-body mt-1">اطلاعات محصول خود را با دقت وارد نمایید.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* عنوان */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-dark-2">عنوان محصول</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="مثلا: گوشی موبایل سامسونگ S24"
            className={inputStyle('title')}
          />
          {errors.title && <span className="text-xs text-red mt-1 block">{errors.title}</span>}
        </div>

        {/* دسته بندی */}
        <div>
          <label className="block text-sm font-bold text-dark-2">دسته‌بندی</label>
          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            className={inputStyle('categorie')}
          >
            <option value="">انتخاب کنید...</option>
            {categories.map((item) => (
              <option key={item._id} value={item.name}>{item.name}</option>
            ))}
          </select>
          {errors.categorie && <span className="text-xs text-red mt-1 block">{errors.categorie}</span>}
        </div>

        {/* وضعیت محصول */}
        <div>
          <label className="block text-sm font-bold text-dark-2">وضعیت</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className={inputStyle('condition')}
          >
            <option value="نو آکبند">نو آکبند</option>
            <option value="استوک">استوک</option>
            <option value="در حد نو">در حد نو</option>
            <option value="کارکرده">کارکرده</option>
          </select>
        </div>

        {/* امتیاز */}
        <div>
          <label className="block text-sm font-bold text-dark-2">امتیاز (0 تا 5)</label>
          <input
            type="number"
            name="reviews"
            value={formData.reviews}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            className={inputStyle('reviews')}
          />
          {errors.reviews && <span className="text-xs text-red mt-1 block">{errors.reviews}</span>}
        </div>

        {/* تعداد */}
        <div>
          <label className="block text-sm font-bold text-dark-2">موجودی انبار</label>
          <input
            type="number"
            name="count"
            value={formData.count}
            onChange={handleChange}
            min="1"
            className={inputStyle('count')}
          />
        </div>

        {/* قیمت */}
        <div>
          <label className="block text-sm font-bold text-dark-2">قیمت (تومان)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={inputStyle('price')}
          />
          {errors.price && <span className="text-xs text-red mt-1 block">{errors.price}</span>}
        </div>

        {/* تاریخ */}
        <div id="date">
          <label className="block text-sm font-bold text-dark-2 mb-1.5">تاریخ ثبت</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={formData.date}
            onChange={(d) =>
              setFormData((p) => ({
                ...p,
                date: d ? faToEn(d.format("YYYY/MM/DD")) : "",
              }))
            }
            inputClass={inputStyle('date')}
            containerClassName="w-full"
          />
          {errors.date && <span className="text-xs text-red mt-1 block">{errors.date}</span>}
        </div>

        {/* بخش تخفیف */}
        <div className="md:col-span-2 bg-meta rounded-xl p-4 flex flex-col gap-4 border border-gray-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasDiscount"
              id="hasDiscount"
              checked={formData.hasDiscount}
              onChange={handleChange}
              className="w-5 h-5 accent-blue"
            />
            <label htmlFor="hasDiscount" className="text-sm font-bold text-dark cursor-pointer">
              این محصول تخفیف دارد
            </label>
          </div>
          {formData.hasDiscount && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-body mb-1">قیمت پس از تخفیف</label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleChange}
                placeholder="قیمت تخفیف خورده را وارد کنید"
                className={inputStyle('discountedPrice')}
              />
            </div>
          )}
        </div>

        {/* توضیحات */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-bold text-dark-2">توضیح کوتاه (Short Description)</label>
            <input
              type="text"
              name="short"
              value={formData.description.short}
              onChange={handleDescriptionChange}
              className={inputStyle('description.short')}
            />
            {errors["description.short"] && <span className="text-xs text-red mt-1 block">{errors["description.short"]}</span>}
          </div>
          <div>
            <label className="block text-sm font-bold text-dark-2">توضیحات کامل</label>
            <textarea
              name="full"
              value={formData.description.full}
              onChange={handleDescriptionChange}
              className={`${inputStyle('description.full')} min-h-[150px] resize-none`}
            />
            {errors["description.full"] && <span className="text-xs text-red mt-1 block">{errors["description.full"]}</span>}
          </div>
        </div>

        {/* تصاویر */}
        <div className="md:col-span-2 space-y-6">
          {["thumbnails", "previews"].map((type) => (
            <div key={type}>
              <h3 className="text-sm font-bold text-dark-2 mb-3">
                {type === "thumbnails" ? "تصاویر بندانگشتی (2 عدد)" : "تصاویر گالری (2 عدد)"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.imgs[type].map((file, i) => (
                  <div
                    key={i}
                    className="relative group border-2 border-dashed border-gray-4 rounded-xl aspect-square flex flex-col items-center justify-center overflow-hidden hover:border-blue transition-colors bg-gray-1"
                  >
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl text-gray-5">+</span>
                        <p className="text-[10px] text-gray-5">انتخاب عکس</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, type, i)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔵 دکمه ثبت: چسبیده در موبایل (Sticky) و عادی در دسکتاپ */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-2 md:relative md:bg-transparent md:border-none md:p-0 z-999">
        <button
          type="submit"
          className="w-full bg-dark hover:bg-blue text-white py-4 rounded-xl font-bold transition-all shadow-lg md:shadow-none"
        >
          ذخیره و انتشار محصول
        </button>
      </div>
    </form>
  );
}