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
} from "@heroicons/react/24/outline";

export default function EditUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helpers
  const pickFromRegisterWith = (arr = [], key) => {
    const item = arr?.find((o) => Object.prototype.hasOwnProperty.call(o, key));
    return item ? item[key] : "";
  };
  const isBlobUrl = (url) => typeof url === "string" && url.startsWith("blob:");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3001/usersData");
        if (!res.ok) throw new Error("خطا در گرفتن اطلاعات کاربران");
        const data = await res.json();
        setUsers(data || []);
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
      const res = await fetch(`http://localhost:3001/usersData/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف کاربر ناموفق بود");

      Swal.fire("حذف شد!", "کاربر با موفقیت حذف شد", "success");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      Swal.fire("خطا!", err.message, "error");
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gray">
        <div className="container py-6">
          <h2 className="text-xl text-center font-bold text-blue mb-4">لیست کاربران</h2>
          <p className="text-center text-dark">در حال بارگذاری...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-h-screen overflow-y-auto bg-gray">
      <div className="container p-4 md:p-6">
        <h2 className="text-xl md:text-2xl text-center font-bold text-blue mb-6">
          لیست کاربران
        </h2>

        <div className="space-y-4">
          {users.map((user) => {
            const email = pickFromRegisterWith(user.registerWith, "email");
            const phone = pickFromRegisterWith(user.registerWith, "phone");

            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-3 shadow-1 hover:shadow-2 transition"
              >
                {/* اطلاعات کاربر */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* آواتار */}
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
                      {/* تاریخ ثبت نام */}
                      <span className="inline-flex items-center gap-1 text-gray-6">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span className="text-gray-6">ثبت نام: {user.dateLogin}</span>
                      </span>

                      {/* ایمیل */}
                      {email && (
                        <span className="inline-flex items-center gap-1 text-gray-6">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span className="truncate">{email}</span>
                        </span>
                      )}

                      {/* تلفن */}
                      {phone && (
                        <span className="inline-flex items-center gap-1 text-gray-6">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleDelete(user.id)}
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
                    href={`/panel/editUsers/${user.id}`}
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

      {/* مودال مشاهده سریع */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2 border border-gray-3 p-5 md:p-6 transform transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* بستن */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 left-3 text-gray-6 hover:text-red transition"
              aria-label="بستن"
              title="بستن"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* هدر مودال */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-3 mb-4">
              {selectedUser?.img ? (
                isBlobUrl(selectedUser.img) ? (
                  <img
                    src={selectedUser.img || null}
                    alt={selectedUser.name || "کاربر"}
                    className="w-12 h-12 rounded-full object-cover border border-gray-3"
                  />
                ) : (
                  <Image
                    src={selectedUser.img || null}
                    alt={selectedUser.name || "کاربر"}
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

              <div>
                <h3 className="text-lg md:text-xl font-bold text-dark">
                  {selectedUser.name} {selectedUser.lastName}
                </h3>
                <p className="text-2xs md:text-xs text-gray-6 mt-1">
                  شناسه کاربر: {selectedUser.id}
                </p>
              </div>
            </div>

            {/* بدنه مودال */}
            <div className="space-y-5">
              {/* اطلاعات اصلی */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-dark mb-1">نام:</p>
                  <p className="text-gray-7">{selectedUser.name}</p>
                </div>

                <div>
                  <p className="font-medium text-dark mb-1">نام خانوادگی:</p>
                  <p className="text-gray-7">{selectedUser.lastName}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="font-medium text-dark mb-1">ایمیل:</p>
                  <p className="text-gray-7">
                    {pickFromRegisterWith(selectedUser.registerWith, "email") || "-"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="font-medium text-dark mb-1">رمز عبور:</p>
                  <p className="text-gray-7">********</p>
                  {/* پسورد واقعی را فقط در صفحه ویرایش کاربر نمایش/ویرایش می‌کنیم */}
                </div>

                <div className="sm:col-span-2">
                  <p className="font-medium text-dark mb-1">تاریخ ثبت نام:</p>
                  <p className="text-gray-7">{selectedUser.dateLogin}</p>
                </div>

                {selectedUser.address && (
                  <div className="sm:col-span-2">
                    <p className="font-medium text-dark mb-1">آدرس:</p>
                    <p className="text-gray-7 leading-6">{selectedUser.address}</p>
                  </div>
                )}
              </div>

              {/* دسته‌بندی‌های پیشنهادی */}
              <div>
                <p className="font-medium text-dark mb-2">دسته‌های پیشنهادی:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.SuggestedCategories?.length ? (
                    selectedUser.SuggestedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-light-5 text-blue text-xs rounded-full border border-blue-light-4"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-5 text-sm">موردی ثبت نشده</span>
                  )}
                </div>
              </div>

              {/* محصولات خریداری‌شده */}
              <div>
                <p className="font-medium text-dark mb-2">محصولات خریداری‌شده:</p>
                {selectedUser.PurchasedProducts?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedUser.PurchasedProducts.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between items-center bg-gray-1 border border-gray-3 p-3 rounded-lg hover:bg-gray-2 transition"
                      >
                        <span className="text-sm text-dark">{p.title}</span>
                        <span className="font-semibold text-green text-sm">
                          {p.hasDiscount ? p.discountedPrice : p.price} $
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-5 text-sm">هیچ محصولی خریداری نشده</p>
                )}
              </div>
            </div>

            {/* فوتِر مودال */}
            <div className="mt-5 pt-4 border-t border-gray-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-md border border-gray-3 text-dark bg-white hover:bg-gray-1 transition"
              >
                بستن
              </button>
              <Link
                href={`/panel/editUsers/${selectedUser.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue text-white hover:bg-blue-dark transition"
              >
                <PencilSquareIcon className="w-5 h-5" />
                ویرایش
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}