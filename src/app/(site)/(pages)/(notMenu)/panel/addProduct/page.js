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
    date: "",
    count: 1, // 🟢 تعداد اولیه محصول (پیش‌فرض 1)
    imgs: {
      thumbnails: [null, null], // 🟢 ذخیره File واقعی (نه blob)
      previews: [null, null],
    },
  });

  const [id] = useState(() => String(Date.now()));
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // URLs
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

  useEffect(() => {
    fetch(`${BASE_URL}${CATEGORYS_URL}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data))
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

  // 📌 آپلود تصاویر
  // اینجا به‌جای blob، خود File ذخیره می‌شود
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      newImgs[type][index] = file; // 🟢 ذخیره File
      return { ...prev, imgs: newImgs };
    });
  };

  // 📌 ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      title,
      price,
      reviews,
      content,
      categorie,
      imgs,
      date,
    } = formData;

    // ولیدیشن
    if (!title || !price || !reviews || !content || !categorie || !date) {
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
      // 🟢 استفاده از FormData برای ارسال فایل
      const form = new FormData();

      form.append("id", id);
      form.append("title", formData.title);
      form.append("content", formData.content);
      form.append("categorie", formData.categorie);
      form.append("date", formData.date);
      form.append("price", formData.price);
      form.append("reviews", formData.reviews);
      form.append("count", formData.count); // 🟢 ارسال count
      form.append("hasDiscount", formData.hasDiscount);
      form.append(
        "discountedPrice",
        formData.hasDiscount ? formData.discountedPrice : ""
      );

      // 🟢 ارسال تصاویر
      formData.imgs.thumbnails.forEach((file) =>
        form.append("thumbnails", file)
      );
      formData.imgs.previews.forEach((file) =>
        form.append("previews", file)
      );

      // 1️⃣ ذخیره محصول
      const resProduct = await fetch(`${BASE_URL}${PRODUCTS_URL}`, {
        method: "POST",
        body: form, // ❗ بدون Content-Type
      });

      if (!resProduct.ok) throw new Error("افزودن محصول انجام نشد");

      // 2️⃣ افزایش تعداد محصولات دسته‌بندی
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.categorie
      );

      if (selectedCategory) {
        console.log(formData);
        
        await fetch(
          `${BASE_URL}${CATEGORYS_URL}/${selectedCategory._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              products: (selectedCategory.products ?? 0) + 1,
            }),
          }
        );
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
        date: "",
        count: 1,
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
        />
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
          onChange={handleChange}
          min="0"
          max="5"
          step="0.1"
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />
      </div>

      {/* تعداد */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          تعداد محصول
        </label>
        <input
          type="number"
          name="count"
          value={formData.count}
          onChange={handleChange}
          min="1"
          className="w-full mt-1 border rounded-xl px-4 py-2"
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
          />
          <label className="ml-2 text-sm text-gray-700">
            دارای تخفیف
          </label>
        </div>

        {formData.hasDiscount && (
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            min="0"
            className="w-full mt-2 border rounded-xl px-4 py-2"
          />
        )}
      </div>

      {/* تاریخ */}
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={formData.date}
        onChange={(d) =>
          setFormData((p) => ({ ...p, date: d?.format("YYYY/MM/DD") }))
        }
        inputClass="w-full border rounded-xl px-4 py-2 text-center"
      />

      {/* دسته بندی */}
      <select
        name="categorie"
        value={formData.categorie}
        onChange={handleChange}
        className="border rounded-xl px-4 py-2"
      >
        <option value="">-- انتخاب کنید --</option>
        {categories.map((item) => (
          <option key={item._id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      {/* تصاویر */}
      {["thumbnails", "previews"].map((type) => (
        <div key={type}>
          <div className="grid grid-cols-2 gap-4">
            {formData.imgs[type].map((file, i) => (
              <div
                key={i}
                className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center"
              >
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-24 h-24 object-cover mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e, type, i)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-[#232936] text-white py-3 rounded-xl font-semibold"
      >
        ذخیره محصول
      </button>
    </form>
  );
}
