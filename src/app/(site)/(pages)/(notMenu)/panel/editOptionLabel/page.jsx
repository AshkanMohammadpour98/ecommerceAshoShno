"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export default function OptionLabel() {
  // ============================================
  // State ها
  // ============================================
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ============================================
  // دریافت داده‌ها (Data Fetching)
  // ============================================
  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/options", { cache: "no-store" });
      const data = await res.json();
      setOptions(data.data || []);
    } catch (error) {
      console.error("خطا در دریافت option ها", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // ============================================
  // هندلرها (CRUD)
  // ============================================

  // افزودن (با استفاده از استایل SweetAlert2)
  const openAddModal = async () => {
    const { value: formData } = await Swal.fire({
      title: '<h3 class="text-xl font-bold text-dark">افزودن ویژگی جدید</h3>',
      html: `
        <div class="flex flex-col gap-3 text-right" dir="rtl">
          <label class="text-sm font-medium text-gray-600">عنوان (Label)</label>
          <input id="label" class="swal2-input !m-0 !w-full !h-10 !text-sm" placeholder="مثال: رنگ">
          
          <label class="text-sm font-medium text-gray-600 mt-2">مقدار (Value)</label>
          <input id="value" class="swal2-input !m-0 !w-full !h-10 !text-sm" placeholder="مثال: #ff0000 یا قرمز">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#3C50E0", // رنگ blue از کانفیگ
      cancelButtonColor: "#9CA3AF",  // رنگ gray-5
      confirmButtonText: "افزودن ویژگی",
      cancelButtonText: "انصراف",
      focusConfirm: false,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg text-sm px-5 py-2.5",
        cancelButton: "rounded-lg text-sm px-5 py-2.5",
      },
      preConfirm: () => ({
        label: document.getElementById("label").value,
        value: document.getElementById("value").value,
      }),
    });

    if (!formData) return;

    if (!formData.label || !formData.value) {
      Swal.fire({
        icon: "warning",
        title: "نقص اطلاعات",
        text: "لطفاً هر دو فیلد را پر کنید.",
        confirmButtonColor: "#FBBF24",
      });
      return;
    }

    try {
      await fetch("/api/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      Swal.fire({
        icon: "success",
        title: "انجام شد",
        text: "ویژگی با موفقیت اضافه شد.",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchOptions();
    } catch {
      Swal.fire("خطا", "مشکلی در افزودن رخ داد", "error");
    }
  };

  // حذف
  const deleteOption = async (_id) => {
    const confirm = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این ویژگی حذف خواهد شد و قابل بازگشت نیست.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F23030", // رنگ red
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
      customClass: {
        popup: "rounded-2xl",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetch(`/api/options/${_id}`, { method: "DELETE" });
      Swal.fire({
        icon: "success",
        title: "حذف شد",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchOptions();
    } catch (e) {
      Swal.fire("خطا", "حذف انجام نشد", "error");
    }
  };

  // ویرایش
  const editOption = async (option) => {
    const { value: formData } = await Swal.fire({
      title: '<h3 class="text-xl font-bold text-dark">ویرایش ویژگی</h3>',
      html: `
        <div class="flex flex-col gap-3 text-right" dir="rtl">
          <label class="text-sm font-medium text-gray-600">عنوان (Label)</label>
          <input id="label" class="swal2-input !m-0 !w-full !h-10 !text-sm" value="${option.label}">
          
          <label class="text-sm font-medium text-gray-600 mt-2">مقدار (Value)</label>
          <input id="value" class="swal2-input !m-0 !w-full !h-10 !text-sm" value="${option.value}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#3C50E0",
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: "ذخیره تغییرات",
      cancelButtonText: "انصراف",
      customClass: {
        popup: "rounded-2xl",
      },
      preConfirm: () => ({
        label: document.getElementById("label").value,
        value: document.getElementById("value").value,
      }),
    });

    if (!formData) return;

    try {
      await fetch(`/api/options/${option._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      fetchOptions();
      Swal.fire({
        icon: "success",
        title: "ویرایش شد",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire("خطا", "ویرایش انجام نشد", "error");
    }
  };

  // فیلتر کردن
  const filteredOptions = options.filter((item) =>
    item.label?.toLowerCase().includes(search.toLowerCase()) || 
    item.value?.toLowerCase().includes(search.toLowerCase())
  );

  // ============================================
  // رندر (UI)
  // ============================================
  return (
    <div className="min-h-screen bg-gray-1 py-10 lg:py-15" dir="rtl">
      <div className="container max-w-[1200px]">
        
        {/* --- هدر --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-heading-5 lg:text-heading-4 font-bold text-dark mb-2 flex items-center gap-2">
              <SwatchIcon className="w-7 h-7 text-blue" />
              مدیریت ویژگی‌ها (Options)
            </h1>
            <p className="text-body text-custom-xs sm:text-custom-sm">
              لیست ویژگی‌های محصول مانند رنگ، سایز و گارانتی را در اینجا مدیریت کنید.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-dark transition-all duration-300 shadow-2 hover:shadow-3 hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5" />
            افزودن ویژگی جدید
          </button>
        </div>

        {/* --- باکس اصلی --- */}
        <div className="bg-white shadow-2 rounded-2xl p-5 sm:p-8 border border-gray-2">
          
          {/* نوار جستجو */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-5" />
            </div>
            <input
              type="text"
              className="w-full h-12 pr-11 pl-4 rounded-xl border-2 border-gray-3 bg-gray-1 text-dark outline-none focus:border-blue focus:ring-4 focus:ring-blue/5 transition-all duration-200 placeholder:text-gray-5 text-custom-sm"
              placeholder="جستجو بر اساس عنوان یا مقدار..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* --- جدول داده‌ها --- */}
          <div className="rounded-xl border border-gray-3 overflow-hidden">
            
            {/* سرستون جدول (فقط در دسکتاپ نمایش داده می‌شود) */}
            <div className="hidden md:grid grid-cols-12 bg-gray-1 p-4 border-b border-gray-3 text-dark font-bold text-custom-sm">
              <div className="col-span-1 text-center text-gray-5">#</div>
              <div className="col-span-4 pr-4">عنوان (Label)</div>
              <div className="col-span-5">مقدار (Value)</div>
              <div className="col-span-2 text-center">عملیات</div>
            </div>

            {/* لیست آیتم‌ها */}
            {loading ? (
              // اسکلت لودینگ
              <div className="divide-y divide-gray-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse flex flex-col md:grid md:grid-cols-12 gap-4">
                    <div className="h-6 bg-gray-2 rounded col-span-1" />
                    <div className="h-6 bg-gray-2 rounded col-span-4" />
                    <div className="h-6 bg-gray-2 rounded col-span-5" />
                    <div className="h-8 bg-gray-2 rounded col-span-2" />
                  </div>
                ))}
              </div>
            ) : filteredOptions.length > 0 ? (
              <div className="divide-y divide-gray-2 bg-white">
                {filteredOptions.map((item, index) => (
                  <div 
                    key={item._id} 
                    className="flex flex-col md:grid md:grid-cols-12 items-center p-4 hover:bg-blue-light-5/30 transition-colors duration-150 group"
                  >
                    
                    {/* شمارنده (مخفی در موبایل) */}
                    <div className="hidden md:block col-span-1 text-center text-gray-5 font-medium">
                      {index + 1}
                    </div>

                    {/* عنوان */}
                    <div className="col-span-12 md:col-span-4 w-full md:w-auto mb-2 md:mb-0 md:pr-4 flex items-center gap-2">
                      <span className="md:hidden text-xs text-gray-5 font-bold bg-gray-2 px-2 py-1 rounded">Label</span>
                      <span className="font-bold text-dark text-custom-sm">{item.label}</span>
                    </div>

                    {/* مقدار */}
                    <div className="col-span-12 md:col-span-5 w-full md:w-auto mb-4 md:mb-0 flex items-center gap-2">
                       <span className="md:hidden text-xs text-gray-5 font-bold bg-gray-2 px-2 py-1 rounded">Value</span>
                       <div className="flex items-center gap-2 bg-gray-1 px-3 py-1.5 rounded-lg border border-gray-2">
                          {/* اگر مقدار رنگ بود، دایره رنگی نمایش بده */}
                          {item.value.startsWith("#") && (
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-3 shadow-sm" 
                              style={{ backgroundColor: item.value }} 
                            />
                          )}
                          <span className="text-body text-custom-xs font-mono">{item.value}</span>
                       </div>
                    </div>

                    {/* دکمه‌های عملیات */}
                    <div className="col-span-12 md:col-span-2 w-full md:w-auto flex justify-end md:justify-center gap-2">
                      <button
                        onClick={() => editOption(item)}
                        className="p-2 text-yellow-dark bg-yellow-light-2 hover:bg-yellow hover:text-white rounded-lg transition-all duration-200"
                        title="ویرایش"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteOption(item._id)}
                        className="p-2 text-red bg-red-light-6 hover:bg-red hover:text-white rounded-lg transition-all duration-200"
                        title="حذف"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // حالت خالی
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-2 rounded-full flex items-center justify-center mb-4">
                  <InboxIcon className="w-10 h-10 text-gray-4" />
                </div>
                <h3 className="text-dark font-bold text-lg mb-2">داده‌ای یافت نشد</h3>
                <p className="text-gray-5 text-sm">
                  {search ? "نتیجه‌ای برای جستجوی شما پیدا نشد." : "هنوز هیچ ویژگی‌ای اضافه نکرده‌اید."}
                </p>
                {!search && (
                   <button 
                     onClick={openAddModal}
                     className="mt-4 text-blue font-semibold hover:underline text-sm"
                   >
                     افزودن اولین مورد
                   </button>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 text-left">
            <p className="text-xs text-gray-5">
              مجموع رکوردها: {options.length}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}