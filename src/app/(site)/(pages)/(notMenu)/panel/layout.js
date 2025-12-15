"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Sidbar from "@/components/saidbar/sidbar";
import { MenuProvider } from "../../../../context/MenuContext";

// const AUTH_COOKIE_NAME = "auth";

// خواندن مقدار کوکی و decode کردن
// function getCookieValue(name) {
//   if (typeof document === "undefined") return null;
//   const raw = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
//   if (!raw) return null;
//   const val = raw.substring(name.length + 1);
//   try {
//     return decodeURIComponent(val);
//   } catch {
//     return val;
//   }
// }

export default function PanelLayout({ children }) {
  const [open, setOpen] = useState(false);
  // const [authorized, setAuthorized] = useState(null); // null => در حال بررسی
  const router = useRouter();

  // useEffect(() => {
  //   let ignore = false;

  //   async function checkAuth() {
  //     try {
  //       // 1) خواندن کوکی
  //       const cookieStr = getCookieValue(AUTH_COOKIE_NAME);
        
  //       // ✅ به جای throw، بررسی و redirect
  //       if (!cookieStr) {
  //         console.log("No auth cookie found, redirecting to signin");
  //         if (!ignore) {
  //           setAuthorized(false);
  //           router.replace("/signin");
  //         }
  //         return;
  //       }

  //       let cred = null;
  //       try {
  //         cred = JSON.parse(cookieStr); // { id, password, rool }
  //       } catch (error) {
  //         console.error("Invalid cookie format:", error);
  //         if (!ignore) {
  //           setAuthorized(false);
  //           router.replace("/signin");
  //         }
  //         return;
  //       }

  //       // بررسی وجود id و password
  //       if (!cred?.id || !cred?.password) {
  //         console.log("Cookie missing id or password");
  //         if (!ignore) {
  //           setAuthorized(false);
  //           router.replace("/signin");
  //         }
  //         return;
  //       }

  //       // 2) درخواست به API با id
  //       const res = await fetch(
  //         `http://localhost:3001/usersData/${encodeURIComponent(cred.id)}`,
  //         { cache: "no-store" }
  //       );
        
  //       if (!res.ok) {
  //         console.error(`User not found: ${cred.id}`);
  //         if (!ignore) {
  //           setAuthorized(false);
  //           router.replace("/signin");
  //         }
  //         return;
  //       }

  //       const data = await res.json();

  //       // 3) گرفتن پسورد از registerWith
  //       const passFromServer = Array.isArray(data?.registerWith)
  //         ? data.registerWith.find((x) => typeof x?.password === "string")?.password
  //         : undefined;

  //       // 4) تطبیق پسورد
  //       if (!passFromServer || passFromServer !== cred.password) {
  //         console.error("Password mismatch");
  //         if (!ignore) {
  //           setAuthorized(false);
  //           router.replace("/signin");
  //         }
  //         return;
  //       }

  //       // ✅ همه چیز OK است
  //       if (!ignore) {
  //         setAuthorized(true);
  //       }

  //     } catch (error) {
  //       // برای هر خطای غیرمنتظره
  //       console.error("Auth check error:", error);
  //       if (!ignore) {
  //         setAuthorized(false);
  //         router.replace("/signin");
  //       }
  //     }
  //   }

  //   checkAuth();
    
  //   return () => {
  //     ignore = true;
  //   };
  // }, [router]);

  // // تا زمان بررسی، لودینگ نمایش بده
  // if (authorized === null) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-100">
  //       <div className="flex items-center gap-3 text-gray-600">
  //         <span className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue animate-spin" />
  //         <span>در حال بررسی دسترسی...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // // اگر authorized === false است، در حال redirect هستیم
  // if (authorized === false) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-100">
  //       <div className="flex items-center gap-3 text-gray-600">
  //         <span className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue animate-spin" />
  //         <span>در حال انتقال به صفحه ورود...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // کاربر مجاز است => محتوای پنل
  return (
    <MenuProvider>
      <div className="flex h-screen bg-gray-100">
        {/* دکمه همبرگری - فقط در موبایل */}
        <button
          className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-lg lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {/* Sidebar */}
        <div
          className={`
            fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
            ${open ? "translate-x-0" : "translate-x-full"}
            lg:translate-x-0 lg:static lg:shadow-none
            z-40
            flex-shrink-0
          `}
        >
          <Sidbar />
        </div>

        {/* Overlay در موبایل وقتی Sidebar باز است */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* محتوای اصلی */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </MenuProvider>
  );
}