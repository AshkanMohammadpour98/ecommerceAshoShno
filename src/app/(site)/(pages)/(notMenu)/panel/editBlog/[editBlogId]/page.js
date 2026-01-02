"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL;
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL

export default function EditBlogForm({ params }) {

  const unwrappedParams = React.use(params);
  const blogId = unwrappedParams.editBlogId; // دقیقاً همنام با پوشه [editBlogId]
  console.log(blogId , 'blogID...');
  
  
  const router = useRouter();

  const [blogData, setBlogData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // ✅ تبدیل اعداد فارسی به انگلیسی
  const faToEnNumbers = (str) => {
    const faNums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const enNums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return str.replace(/[۰-۹]/g, (w) => enNums[faNums.indexOf(w)]);
  };

  // ✅ گرفتن دیتای بلاگ و دسته‌بندی‌ها
  useEffect(() => {
    fetch(`${BASE_URL}${BLOGS_URL}/${blogId}`)
      .then((res) => res.json())
      .then((data) => {
        setBlogData(data);
        

        // ست کردن تاریخ پیش‌فرض DatePicker
        if (data.date) {
          const enDate = faToEnNumbers(data.date); 
          const [year, month, day] = enDate.split("/").map(Number);

          const defaultDate = new DateObject({
            calendar: persian,
            locale: persian_fa,
            digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], // لاتین
            year,
            month,
            day,
          });

          setSelectedDate(defaultDate);
        }
      })
      .catch(() => setBlogData(null));

    fetch(`${BASE_URL}${CATEGORYS_URL}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data))
      .catch(() => setCategories([]));

      console.log(blogData , categories , 'blog data ,... , categories...');
      
  }, [blogId]);

  if (!blogData) {
    return <p className="text-center text-gray-500">در حال بارگذاری...</p>;
  }

  // تغییر ورودی‌ها
  const handleChange = (e) => {
    setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  // تغییر عکس
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setBlogData({ ...blogData, img: imgURL  });
    }
  };

  // ثبت تغییرات
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      Swal.fire({
        title: "خطا!",
        text: "لطفاً یک تاریخ انتخاب کنید.",
        icon: "warning",
        confirmButtonText: "باشه",
      });
      return;
    }

    // ✅ تاریخ نهایی لاتین
    const formattedDate = selectedDate.format("YYYY/MM/DD");

    const updatedBlog = { ...blogData, date: formattedDate };

    try {
      const res = await fetch(`${BASE_URL}${BLOGS_URL}/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBlog),
      });

      if (res.ok) {
        Swal.fire({
          title: "موفقیت!",
          text: "مقاله با موفقیت ویرایش شد.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => router.push("/panel/editBlog"));
      } else {
        Swal.fire({
          title: "خطا!",
          text: "ویرایش مقاله با مشکل مواجه شد.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "خطای شبکه!",
        text: "لطفاً اتصال اینترنت یا سرور را بررسی کنید.",
        icon: "warning",
        showConfirmButton: false,
          timer: 1500,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 max-h-screen overflow-y-auto"
    >
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-2">
        ویرایش مقاله
      </h2>

      {/* عنوان */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          عنوان مقاله
        </label>
        <input
          type="text"
          name="title"
          value={blogData.title || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* تاریخ */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          تاریخ انتشار
        </label>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          calendar={persian}
          locale={persian_fa}
          format="YYYY/MM/DD"
          digits={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]} // ✅ نمایش لاتین
          placeholder="تاریخ را انتخاب کنید"
        />
        {selectedDate && (
          <p style={{ marginTop: "10px" }}>
            تاریخ انتخاب‌شده: {selectedDate.format("YYYY/MM/DD")}
          </p>
        )}
      </div>

      {/* بازدید */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          تعداد بازدید
        </label>
        <input
          type="number"
          name="views"
          value={blogData.views || 0}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* دسته‌بندی */}
      <div>
        <label className="text-sm font-semibold text-gray-600 mb-2">
          دسته‌بندی:
        </label>
        <select
          name="categorie"
          value={blogData.categorie || ""}
          onChange={handleChange}
          className="border rounded-xl px-4 py-2"
        >
          {categories.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* محتوا */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          متن مقاله
        </label>
        <textarea
          name="content"
          value={blogData.content || ""}
          onChange={handleChange}
          rows="6"
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* عکس */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          تصویر مقاله
        </label>
        <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center">
          {blogData.img ? (
            <img
              src={blogData.img || null}
              alt="preview"
              className="w-32 h-32 object-cover rounded-lg mb-2"
            />
          ) : (
            <span className="text-gray-400 text-sm mb-2">
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
      <button
        type="submit"
        className="w-full bg-[#232936] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        ذخیره تغییرات
      </button>
    </form>
  );
}
