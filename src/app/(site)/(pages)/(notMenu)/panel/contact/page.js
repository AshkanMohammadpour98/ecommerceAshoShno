"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ContactAdmin() {
  const [formData, setFormData] = useState({
    name: "", phone: "", landlinePhone: "", email: "", address: "", isActive: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact").then(res => res.json()).then(data => {
      if (data._id) setFormData(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "بروزرسانی موفق",
          text: "اطلاعات با موفقیت ذخیره شد",
          confirmButtonColor: "#3C50E0", // رنگ blue اصلی شما
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message });
    }
  };

  if (loading) return <div className="flex justify-center p-25 text-blue">در حال بارگذاری...</div>;

  return (
    <div className="container py-10 font-euclid-circular-a dir-rtl" dir="rtl">
      <div className="max-w-[800px] mx-auto bg-white border border-gray-3 shadow-2 rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-meta p-6 border-b border-gray-3">
          <h2 className="text-heading-6 font-bold text-dark">تنظیمات اطلاعات تماس</h2>
          <p className="text-custom-sm text-body mt-1">اطلاعات ارتباطی سایت را از این بخش مدیریت کنید.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7.5 space-y-5.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
            
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-custom-sm font-medium text-dark">نام مجموعه / شخص</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-4 bg-transparent py-2.5 px-4.5 text-dark outline-none transition focus:border-blue focus:shadow-input"
                placeholder="مثلا: فروشگاه لپ‌تاپ آشو"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-custom-sm font-medium text-dark">ایمیل رسمی</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-4 bg-transparent py-2.5 px-4.5 text-dark outline-none transition focus:border-blue focus:shadow-input text-left"
                dir="ltr"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-2">
              <label className="text-custom-sm font-medium text-dark">شماره موبایل</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-4 bg-transparent py-2.5 px-4.5 text-dark outline-none transition focus:border-blue focus:shadow-input text-left"
                dir="ltr"
              />
            </div>

            {/* Landline */}
            <div className="flex flex-col gap-2">
              <label className="text-custom-sm font-medium text-dark">تلفن ثابت</label>
              <input
                type="text"
                name="landlinePhone"
                value={formData.landlinePhone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-4 bg-transparent py-2.5 px-4.5 text-dark outline-none transition focus:border-blue focus:shadow-input text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-custom-sm font-medium text-dark">آدرس فیزیکی</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-4 bg-transparent py-2.5 px-4.5 text-dark outline-none transition focus:border-blue focus:shadow-input"
            ></textarea>
          </div>

          {/* Status Switch */}
          <div className="flex items-center gap-3 py-2">
             <label className="relative cursor-pointer">
              <input 
                type="checkbox" 
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-4 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
            </label>
            <span className="text-custom-sm text-body">نمایش اطلاعات در سایت فعال باشد</span>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto md:px-15 py-3 bg-blue text-white rounded-lg font-bold hover:bg-blue-dark transition-all shadow-2 active:scale-95"
            >
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}