"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidbar from "@/components/saidbar/sidbar";
import { MenuProvider } from "../../../../context/MenuContext";
import { UserProvider } from "@/app/context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function PanelLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'auth' یا 'role'
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        const data = await res.json();
        
        if (res.status === 401) {
          // توکن نامعتبر یا موجود نیست
          router.replace("/signin");
        } else if (res.status === 403) {
          // کاربر لاگین هست ولی ادمین نیست
          setErrorType("role");
        } else if (res.ok) {
          setUser(data.user);
        }
      })
      .catch(() => router.replace("/signin"));
  }, [router]);

  // نمایش پیام اختصاصی اگر کاربر ادمین نبود
  if (errorType === "role") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border border-red-100">
          <div className="text-red-500 mb-4">
             <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">دسترسی محدود شده</h2>
          <p className="text-gray-600 mb-8">
            حساب کاربری شما سطح دسترسی لازم (admin) برای ورود به این بخش را ندارد.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-[#232936] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  // لودینگ تا زمان تایید هویت
  if (!user && !errorType) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">در حال بررسی سطح دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider user={user}>
      <MenuProvider>
        <div className="flex h-screen bg-gray-100">
          {/* ... باقی کدهای Sidebar و دکمه همبرگری همان کدهای قبلی شماست ... */}
          <button
            className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-lg lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <Bars3Icon className="h-6 w-6 text-gray-700" />}
          </button>

          <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
            ${open ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 lg:static z-40`}>
            <Sidbar />
          </div>

          <main className="flex-1 p-4 overflow-y-auto">
            {children}
          </main>
        </div>
      </MenuProvider>
    </UserProvider>
  );
}