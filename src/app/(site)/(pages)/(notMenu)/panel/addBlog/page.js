"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddBlogForm() {
  const router = useRouter();

  // 📌 تاریخ امروز با اعداد لاتین
  const initialDate = new DateObject({
    calendar: persian,
    locale: persian_fa,
    digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  }).format("YYYY/MM/DD");

  const [categories, setCategories] = useState([]);

  // فرم با تاریخ پیش‌فرض
  const [formData, setFormData] = useState({
    title: "",
    date: initialDate,
    views: 0,
    img: "",
    categorie: "",
    content: "",
  });

  // گرفتن دسته‌بندی‌ها
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // تغییر ورودی‌ها
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // انتخاب عکس
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, img: imageUrl });
    }
  };

  // ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBlog = { ...formData, id: String(Date.now()) };

    await fetch("http://localhost:3001/blogData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlog),
    });

    router.push("/blogs/blog-grid-with-sidebar");
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="w-full  mx-auto bg-white shadow-xl rounded-2xl 
             p-4 sm:p-6 lg:p-8 space-y-6 max-h-screen overflow-y-auto"
>
  <h2 className="text-center text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 border-b pb-2">
    افزودن بلاگ
  </h2>

  {/* تاریخ امروز */}
  <div className="p-4 sm:p-6" style={{ direction: "rtl" }}>
    <h2 className="text-base sm:text-lg font-semibold">تاریخ امروز (شمسی)</h2>
    <p className="text-blue-600 font-mono text-sm sm:text-base">
      {formData.date}
    </p>
  </div>

  {/* عنوان و دسته‌بندی */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* عنوان */}
    <div>
      <label className="block text-sm font-semibold text-gray-600">
        عنوان بلاگ
      </label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="w-full mt-1 border rounded-xl px-3 py-2 sm:px-4 sm:py-2 
                   focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
        placeholder="مثلاً آموزش نکست جی‌اس"
        required
      />
    </div>

    {/* انتخاب دسته‌بندی */}
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-2 block">
        انتخاب دسته‌بندی:
      </label>
      <select
        name="categorie"
        value={formData.categorie}
        onChange={handleChange}
        className="w-full border rounded-xl px-3 py-2 sm:px-4 sm:py-2 
                   text-sm sm:text-base"
      >
        <option value="">-- انتخاب کنید --</option>
        {categories.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* متن بلاگ */}
  <div>
    <label className="block text-sm font-semibold text-gray-600">
      متن بلاگ
    </label>
    <textarea
      name="content"
      value={formData.content}
      onChange={handleChange}
      rows={6}
      className="w-full mt-1 border rounded-xl px-3 py-2 sm:px-4 sm:py-3 
                 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
      placeholder="محتوای کامل بلاگ..."
    ></textarea>
  </div>

  {/* عکس */}
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-2">
      تصویر مقاله
    </label>
    <div className="border-2 border-dashed rounded-xl p-4 flex flex-col 
                    items-center sm:flex-row sm:items-center sm:gap-4">
      {formData.img ? (
        <img
          src={formData.img || null}
          alt="img add blog"
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 
                     object-cover rounded-lg mb-2 sm:mb-0"
        />
      ) : (
        <span className="text-gray-400 text-sm mb-2 sm:mb-0">
          انتخاب تصویر مقاله
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="text-sm"
      />
    </div>
  </div>

  {/* دکمه ثبت */}
  <div className="flex justify-center">
    <button
      type="submit"
      className="w-full sm:w-auto bg-[#232936] text-white py-3 px-6 
                 rounded-xl font-semibold hover:bg-blue-700 transition"
    >
      ذخیره بلاگ
    </button>
  </div>
</form>

  );
}
