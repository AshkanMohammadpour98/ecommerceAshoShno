"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  UserCircleIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function EditUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: بررسی URL عکس
  const isBlobUrl = (url) => typeof url === "string" && url.startsWith("blob:");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("خطا در گرفتن اطلاعات کاربران");
        
        const response = await res.json();

        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("ساختار دیتای دریافتی صحیح نیست:", response);
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این کاربر بعد از حذف قابل بازیابی نخواهد بود!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف کاربر ناموفق بود");

      Swal.fire("حذف شد!", "کاربر با موفقیت حذف شد", "success");
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
      if ((selectedUser?._id || selectedUser?.id) === id) setSelectedUser(null);
    } catch (err) {
      Swal.fire("خطا!", err.message, "error");
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-1">
        <div className="container py-6">
          <h2 className="text-xl text-center font-bold text-blue mb-4">لیست کاربران</h2>
          <p className="text-center text-dark">در حال بارگذاری...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-h-screen overflow-y-auto bg-gray-1">
      <div className="container p-4 md:p-6">
        <h2 className="text-xl md:text-2xl text-center font-bold text-blue mb-6">
          لیست کاربران 
          <span className="text-sm font-normal text-gray-5 mr-2">({users.length} نفر)</span>
        </h2>

        <div className="space-y-4">
          {users.map((user) => {
            const email = user.email;
            const phone = user.phone;
            const userId = user._id || user.id;

            return (
              <div
                key={userId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-3 shadow-1 hover:shadow-2 transition"
              >
                {/* اطلاعات کاربر */}
                <div className="flex items-center gap-3 min-w-0">
                  {user?.img ? (
                    isBlobUrl(user.img) ? (
                      <img
                        src={user.img || null}
                        alt={user.name || "کاربر"}
                        className="w-12 h-12 rounded-full object-cover border border-gray-3"
                      />
                    ) : (
                      <Image
                        src={user.img || null}
                        alt={user.name || "کاربر"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-gray-3"
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-light-5 border border-gray-3 flex items-center justify-center text-blue">
                      <UserCircleIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-dark truncate">
                      {user.name} {user.lastName}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-2xs md:text-xs">
                      <span className="inline-flex items-center gap-1 text-gray-6">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span className="text-gray-6">{user.dateLogin}</span>
                      </span>

                      {email && (
                        <span className="inline-flex items-center gap-1 text-gray-6">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span className="truncate">{email}</span>
                        </span>
                      )}

                      {phone && (
                        <span className="inline-flex items-center gap-1 text-gray-6">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{phone}</span>
                        </span>
                      )}
                      
                      {user.role && (
                         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-light-5 text-red' : 'bg-blue-light-5 text-blue'}`}>
                           {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleDelete(userId)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-1 hover:bg-red hover:text-white hover:shadow-2 transition"
                    title="حذف کاربر"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setSelectedUser(user)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-1 hover:bg-blue hover:text-white hover:shadow-2 transition"
                    title="مشاهده سریع"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>

                  <Link
                    href={`/panel/editUsers/${userId}`}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-1 hover:bg-green hover:text-white hover:shadow-2 transition"
                    title="ویرایش"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============== مودال مشاهده سریع ============== */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={() => setSelectedUser(null)}
        >
          {/* کانتینر اصلی مودال با ارتفاع ریسپانسیو */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2 border border-gray-3 flex flex-col max-h-[90vh] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. هدر ثابت */}
            <div className="flex items-center justify-between p-5 border-b border-gray-3 flex-shrink-0">
               <div className="flex items-center gap-3">
                  {selectedUser?.img ? (
                    isBlobUrl(selectedUser.img) ? (
                      <img src={selectedUser.img} alt="User" className="w-14 h-14 rounded-full object-cover border border-gray-3" />
                    ) : (
                      <Image src={selectedUser.img} alt="User" width={56} height={56} className="w-14 h-14 rounded-full object-cover border border-gray-3" unoptimized />
                    )
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-light-5 border border-gray-3 flex items-center justify-center text-blue">
                      <UserCircleIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-dark">
                      {selectedUser.name} {selectedUser.lastName}
                    </h3>
                    <p className="text-xs text-gray-5 mt-1">
                      ID: {selectedUser._id || selectedUser.id}
                    </p>
                  </div>
               </div>
               
               <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-5 hover:text-red transition p-1"
                >
                  <XMarkIcon className="w-7 h-7" />
                </button>
            </div>

            {/* 2. بدنه اسکرول‌خور */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* شبکه اطلاعات */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-5 mb-1">نقش کاربری</span>
                    <span className="text-sm font-medium text-dark">{selectedUser.role === 'admin' ? 'مدیر کل' : 'کاربر عادی'}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-5 mb-1">جنسیت</span>
                    <span className="text-sm font-medium text-dark">{selectedUser.gender === 'male' ? 'آقا' : 'خانم'}</span>
                 </div>
                 <div className="flex flex-col sm:col-span-2">
                    <span className="text-xs text-gray-5 mb-1">ایمیل</span>
                    <span className="text-sm font-medium text-dark">{selectedUser.email || "---"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-5 mb-1">تلفن تماس</span>
                    <span className="text-sm font-medium text-dark dir-ltr text-right">{selectedUser.phone || "---"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-5 mb-1">تاریخ عضویت</span>
                    <span className="text-sm font-medium text-dark">{selectedUser.dateLogin}</span>
                 </div>
                 {selectedUser.address && (
                    <div className="flex flex-col sm:col-span-2 bg-gray-1 p-3 rounded-lg">
                        <span className="flex items-center gap-1 text-xs text-gray-5 mb-1">
                           <MapPinIcon className="w-3 h-3"/> آدرس
                        </span>
                        <p className="text-sm text-dark leading-relaxed">{selectedUser.address}</p>
                    </div>
                 )}
              </div>

              {/* دسته‌بندی‌ها */}
              <div>
                <p className="text-sm font-bold text-dark mb-3">علاقه‌مندی‌ها</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.SuggestedCategories?.length ? (
                    selectedUser.SuggestedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-light-5 text-blue text-xs font-medium rounded-full border border-blue-light-4"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-5 text-xs italic">موردی ثبت نشده</span>
                  )}
                </div>
              </div>

              {/* بخش محصولات با UI بهبود یافته */}
              <div className="bg-gray-1 border border-gray-3 rounded-xl p-4">
                 <div className="flex justify-between items-center mb-4 border-b border-gray-3 pb-2">
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-dark"/>
                        <p className="text-sm font-bold text-dark">محصولات خریداری‌شده</p>
                    </div>
                    <span className="text-xs bg-blue text-white px-2 py-1 rounded-full">
                       {selectedUser.PurchasedProducts?.length || 0} مورد
                    </span>
                 </div>

                 {selectedUser.PurchasedProducts?.length > 0 ? (
                    // لیست اسکرول‌خور برای محصولات زیاد
                    <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                       {selectedUser.PurchasedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-3 hover:border-blue transition-colors group"
                          >
                            <div className="flex flex-col">
                               <span className="text-sm font-medium text-dark group-hover:text-blue transition-colors">{p.title}</span>
                               <span className="text-[10px] text-gray-5 mt-0.5">{p.dateSlase || "بدون تاریخ"}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                {p.hasDiscount && (
                                   <span className="text-[10px] text-gray-4 line-through">{p.price.toLocaleString()}</span>
                                )}
                                <span className="font-bold text-green text-sm">
                                  {(p.hasDiscount ? p.discountedPrice : p.price).toLocaleString()} $
                                </span>
                            </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-6 text-gray-5">
                       <p className="text-sm">هنوز خریدی انجام نشده است.</p>
                    </div>
                 )}
              </div>
            </div>

            {/* 3. فوتر ثابت */}
            <div className="p-4 border-t border-gray-3 bg-gray-50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-3 text-dark bg-white hover:bg-gray-1 transition text-sm font-medium"
              >
                بستن
              </button>
              <Link
                href={`/panel/editUsers/${selectedUser._id || selectedUser.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue text-white hover:bg-blue-dark transition text-sm font-medium shadow-1 hover:shadow-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                ویرایش کامل
              </Link>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}