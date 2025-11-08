"use client";

import { useState, useEffect } from "react";
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
  content: "",
  date: "", // افزودن فیلد تاریخ
  imgs: {
    thumbnails: ["", ""],
    previews: ["", ""],
  },
});

  const [id] = useState(() => String(Date.now()));
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // 📌 تغییر فیلدهای فرم
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📌 آپلود تصاویر (نمایش با لینک کوتاه Blob)
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      newImgs[type][index] = objectUrl;
      return { ...prev, imgs: newImgs };
    });
  };

  // 📌 ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, price, reviews, content, categorie, imgs } = formData;

    // ولیدیشن
    if (!title || !price || !reviews || !content || !categorie) {
      Swal.fire({
        icon: "warning",
        title: "لطفا همه فیلدها را پر کنید",
      });
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
      // 1️⃣ ذخیره محصول
      const resProduct = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id }),
      });

      if (!resProduct.ok) throw new Error("افزودن محصول انجام نشد");

      // 2️⃣ افزایش محصولات دسته‌بندی
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.categorie
      );
      if (selectedCategory) {
        const resCategory = await fetch(
          `http://localhost:3000/categories/${selectedCategory.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              products: (selectedCategory.products ?? 0) + 1,
            }),
          }
        );
        if (!resCategory.ok)
          throw new Error("بروزرسانی دسته‌بندی انجام نشد");
      }

      // پیام موفقیت
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
        content: "",
        imgs: { thumbnails: ["", ""], previews: ["", ""] },
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 max-h-screen overflow-y-auto"
    >
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-2">
        افزودن محصول
      </h2>

      {/* عنوان */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          عنوان محصول
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
          placeholder="مثلاً iPhone 14 Plus"
        />
      </div>

      {/* توضیحات */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          توضیحات محصول
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full mt-1 border rounded-xl px-4 py-2 min-h-[100px]"
          placeholder="یک توضیح درباره ویژگی‌های محصول وارد کنید..."
        ></textarea>
      </div>

{/* امتیاز */}
<div>
  <label className="block text-sm font-semibold text-gray-600">
    Reviews (امتیاز)
  </label>
  <input
    type="number"
    name="reviews"
    value={formData.reviews}
    onChange={(e) => {
      const value = Math.min(Math.max(Number(e.target.value), 0), 5); // محدود بین 0 تا 5
      setFormData((prev) => ({ ...prev, reviews: value }));
    }}
    min="0"
    max="5"
    step="0.1"
    required
    className="w-full mt-1 border rounded-xl px-4 py-2"
    placeholder="از 0 تا 5"
  />
</div>

      {/* قیمت + تخفیف */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          قیمت
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            name="hasDiscount"
            checked={formData.hasDiscount}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600"
          />
          <label className="ml-2 text-sm text-gray-700">دارای تخفیف</label>
        </div>

        {formData.hasDiscount && (
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            min="0"
            placeholder="قیمت با تخفیف"
            className="w-full mt-2 border rounded-xl px-4 py-2"
          />
        )}
      </div>
{/* تاریخ محصول */}
<div>
  <label className="block text-sm font-semibold text-gray-600 mb-2">
    تاریخ افزودن محصول
  </label>
  <DatePicker
    calendar={persian}
    locale={persian_fa}
    value={formData.date}
    onChange={(dateObj) => {
      // تبدیل اعداد فارسی به لاتین
      const toEnglishDigits = (str) =>
        str.replace(/[\u06F0-\u06F9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
      
      const formattedDate = toEnglishDigits(dateObj?.format("YYYY/MM/DD"));
      setFormData((prev) => ({ ...prev, date: formattedDate }));
    }}
    inputClass="w-full border rounded-xl px-4 py-2 text-center"
    placeholder="انتخاب تاریخ (مثلاً 1404/02/02)"
  />
</div>

      {/* دسته بندی */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          انتخاب دسته بندی
        </label>
        <select
          name="categorie"
          value={formData.categorie}
          onChange={handleChange}
          required
          className="border rounded-xl px-4 py-2"
        >
          <option value="">-- انتخاب کنید --</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Thumbnails */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          تصاویر کوچک (Thumbnails)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {formData.imgs.thumbnails.map((thumb, i) => (
            <div key={i} className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center">
              {thumb ? (
                <img
                  src={thumb}
                  alt="thumb"
                  className="w-24 h-24 object-cover rounded mb-2"
                />
              ) : (
                <span className="text-gray-400 text-sm mb-2">انتخاب عکس {i + 1}</span>
              )}
              <input
                type="file"
                accept="image/*"
                required={!thumb}
                onChange={(e) => handleImageChange(e, "thumbnails", i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Previews */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          تصاویر اصلی (Previews)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {formData.imgs.previews.map((prev, i) => (
            <div key={i} className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center">
              {prev ? (
                <img
                  src={prev}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              ) : (
                <span className="text-gray-400 text-sm mb-2">انتخاب عکس {i + 1}</span>
              )}
              <input
                type="file"
                accept="image/*"
                required={!prev}
                onChange={(e) => handleImageChange(e, "previews", i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* دکمه ثبت */}
      <button
        type="submit"
        className="w-full bg-[#232936] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        ذخیره محصول
      </button>
    </form>
  );
}