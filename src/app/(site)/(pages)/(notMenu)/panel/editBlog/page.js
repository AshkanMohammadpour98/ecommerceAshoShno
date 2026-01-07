"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL;

export default function EditBlogs() {

  // ------------------ state ها ------------------
  const [blogData, setBlogData] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // مودال مشاهده سریع
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // ------------------ گرفتن دیتا ------------------
  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}${BLOGS_URL}`);
      const data = await res.json();
      setBlogData(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ------------------ مشاهده سریع ------------------
  const openQuickView = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setIsModalOpen(false);
  };

  // ------------------ حذف مقاله ------------------
  const handleDelete = async (blog) => {
    const confirm = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف"
    });

    if (!confirm.isConfirmed) return;

    setDeletingId(blog._id);

    try {
      const res = await fetch(`${BASE_URL}${BLOGS_URL}/${blog._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف مقاله ناموفق بود");

      Swal.fire({
        icon: "success",
        title: "مقاله حذف شد",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchBlogs();
    } catch (err) {
      Swal.fire("خطا!", err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section dir="rtl" className="overflow-y-scroll h-screen relative pb-20 pt-2 lg:pt-10 xl:pt-12 bg-[#f3f4f6]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

        {/*  لیست مقالات در حالت گرید (شبکه‌ای) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
          {blogData.map((blog) => (
            <div
              key={blog._id}
              className="group relative shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4 text-right"
            >

              {/* تصویر بلاگ */}
            {/* تصویر بلاگ */}
<div className="relative overflow-hidden rounded-md">
  <Image
    // اگر تصویر داشت از همون مسیر ذخیره شده در دیتابیس استفاده می‌کنیم
    // مثال: /uploads/blogs/imageName-123.jpg
    src={blog.img}
    alt={blog.title || "blog image"}
    width={330}
    height={210}
    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
  />

  {/* آیکون‌ها روی hover (دست نخورده) */}
  <div
    className="
      absolute inset-0 flex items-center justify-center gap-3
      bg-black/30
      opacity-0 translate-y-4
      group-hover:opacity-100 group-hover:translate-y-0
      transition-all duration-300
    "
  >
    {/* مشاهده سریع */}
    <button
      onClick={() => openQuickView(blog)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue text-white shadow-md"
    >
      <EyeIcon className="h-5 w-5" />
    </button>

    {/* ویرایش */}
    <Link href={`/panel/editBlog/${blog._id}`}>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-white shadow-md">
        <PencilSquareIcon className="h-5 w-5" />
      </button>
    </Link>

    {/* حذف */}
    <button
      onClick={() => handleDelete(blog)}
      disabled={deletingId === blog._id}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md
        ${deletingId === blog._id ? "bg-gray-400" : "bg-red"}`}
    >
      {deletingId === blog._id ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <TrashIcon className="h-5 w-5" />
      )}
    </button>
  </div>
</div>


              {/* اطلاعات بلاگ */}
              <div className="mt-5.5">
                {/* تاریخ و بازدید */}
                <span className="flex items-center gap-3 mb-2.5 text-gray-600 text-sm">
                  <span>{blog.date}</span>
                  <span className="block w-px h-4 bg-gray-400"></span>
                  <span>{blog.views} بازدید</span>
                </span>

                {/* عنوان */}
                <h2 className="font-medium text-dark text-lg sm:text-xl mb-4 hover:text-blue transition">
                  <Link href={`/panel/editBlog/${blog._id}`}>
                    {blog.title}
                  </Link>
                </h2>

                {/* ادامه مطلب */}
                <Link
                  href={`/panel/editBlog/${blog._id}`}
                  className="text-sm inline-flex items-center gap-2 hover:text-blue transition"
                >
                  بیشتر
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ------------------ مودال مشاهده سریع ------------------ */}
      {isModalOpen && selectedBlog && (
        <div className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[700px] rounded-xl p-6 relative animate-fade-in">

            {/* بستن مودال */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red hover:text-white transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* تصویر */}
            <Image
              src={selectedBlog.img }
              alt={selectedBlog.title}
              width={600}
              height={350}
              className="rounded-lg w-full object-cover mb-4"
            />

            {/* اطلاعات */}
            <h3 className="text-2xl font-bold mb-2">{selectedBlog.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedBlog.date} • {selectedBlog.views} بازدید
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              {selectedBlog.content || "توضیحی برای این مقاله ثبت نشده است."}
            </p>

            <Link
              href={`/panel/editBlog/${selectedBlog._id}`}
              className="inline-block bg-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              رفتن به ویرایش مقاله
            </Link>

          </div>
        </div>
      )}
    </section>
  );
}
