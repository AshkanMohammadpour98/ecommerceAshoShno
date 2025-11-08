"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Heroicons (outline) یکدست
import {
  UserCircleIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// نام کوکی
const AUTH_COOKIE_NAME = "auth";

// خواندن کوکی
function readCookie(name) {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}

// پارس امن JSON
function safeParseJSON(str) {
  if (!str) return null;
  try {
    return JSON.parse(decodeURIComponent(str));
  } catch {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { openCartModal } = useCartModalContext();
  const [options, setOptions] = useState([]);

  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // وضعیت احراز هویت کاربر
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const pathname = usePathname();

  const handleOpenCartModal = () => {
    openCartModal();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    setStickyMenu(window.scrollY >= 80);
  };

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then((data) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => setOptions([]));
  }, []);

  // لیسنر اسکرول
  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  // تابع مشترک: چک کردن کوکی + اعتبارسنجی از API
  const checkAuth = useCallback(() => {
    const raw = readCookie(AUTH_COOKIE_NAME);
    const authData = safeParseJSON(raw); // { id, password, rool }

    if (!authData?.id || !authData?.password) {
      setCurrentUser(null);
      setAuthChecked(true);
      return;
    }

    fetch(`http://localhost:3000/usersData/${encodeURIComponent(authData.id)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((userData) => {
        const serverPassword = Array.isArray(userData?.registerWith)
          ? userData.registerWith.find((item) => item?.password)?.password
          : undefined;

        if (serverPassword && serverPassword === authData.password) {
          setCurrentUser(userData); // کاربر معتبر
        } else {
          setCurrentUser(null); // پسورد ناسازگار
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // 1) چک دوباره Auth روی تغییر مسیر
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  // 2) گوش دادن به رویداد سفارشی، فوکوس تب، BroadcastChannel و storage (sync بین تب‌ها)
  useEffect(() => {
    const onAuthChanged = () => checkAuth();
    window.addEventListener("auth:changed", onAuthChanged);
    window.addEventListener("focus", onAuthChanged);

    // Sync بین تب‌ها با storage event
    const onStorage = (e) => {
      if (e.key === "auth:broadcast") checkAuth();
    };
    window.addEventListener("storage", onStorage);

    // BroadcastChannel بین تب‌ها
    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("auth");
        bc.onmessage = () => checkAuth();
      }
    } catch {}

    return () => {
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener("focus", onAuthChanged);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, [checkAuth]);

  const isAuthed = authChecked && !!currentUser;

  return (
    <header
      className={`fixed left-0 top-0 w-full z-50 bg-white transition-all ease-in-out duration-300 ${
        stickyMenu && "shadow"
      }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        {/* header top start */}
        <div
          className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 ${
            stickyMenu ? "py-4" : "py-6"
          }`}
        >
          {/* header top left */}
          <div className="xl:w-auto flex-col sm:flex-row w-full flex sm:justify-between sm:items-center gap-5 sm:gap-10">
            <Link className="flex-shrink-0" href="/">
              <Image
                src="/images/logo/logoAsoShno.png"
                alt="Logo"
                width={219}
                height={36}
                priority
              />
            </Link>

            <div className="max-w-[475px] w-full">
              <form>
                <div className="flex items-center">
                  <CustomSelect options={options} />

                  <div className="relative max-w-[333px] sm:min-w-[333px] w-full">
                    {/* divider */}
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4"></span>

                    <input
                      onChange={(e) => setSearchQuery(e.target.value)}
                      value={searchQuery}
                      type="search"
                      name="search"
                      id="search"
                      placeholder="دنبال چی میگردی؟"
                      autoComplete="off"
                      className="custom-search w-full rounded-r-[5px] bg-gray-1 !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200"
                    />

                    <button
                      id="search-btn"
                      aria-label="جستجو"
                      className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
                      type="button"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5 text-dark hover:text-blue" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* header top right */}
          <div className="flex w-full lg:w-auto items-center gap-7.5">
            <div className="hidden xl:flex items-center gap-3.5">
              {/* پشتیبانی */}
              <PhoneIcon className="w-6 h-6 text-blue" />
              <div>
                <span className="block text-2xs text-dark-4 uppercase">24/7 پشتیبانی</span>
                <p className="font-medium text-custom-sm text-dark">(+444) 462-3477</p>
              </div>
            </div>

            {/* divider */}
            <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span>

            <div className="flex w-full lg:w-auto justify-between items-center gap-5">
              <div className="flex items-center gap-5">
                {/* حساب کاربری */}
                {authChecked ? (
                  currentUser ? (
                    <Link href={`/my-account/${currentUser.id}`} className="flex items-center gap-2.5">
                      {currentUser?.img ? (
                        <img
                          src={currentUser.img}
                          alt={`${currentUser.name} ${currentUser.lastName ?? ""}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-blue" />
                      )}
                      <div>
                        <span className="block text-2xs text-dark-4 uppercase">پنل</span>
                        <p className="font-medium text-custom-sm text-dark">
                          {currentUser?.name ?? "حساب من"}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <Link href="/signin" className="flex items-center gap-2.5">
                      <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-blue" />
                      <div>
                        <span className="block text-2xs text-dark-4 uppercase">حساب</span>
                        <p className="font-medium text-custom-sm text-dark">ورود / ثبت‌نام</p>
                      </div>
                    </Link>
                  )
                ) : (
                  // لودینگ کوتاه
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-full bg-gray-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-3 rounded animate-pulse"></div>
                  </div>
                )}

                {/* سبد خرید: فقط وقتی کاربر لاگین است نمایش بده */}
                {isAuthed && (
                  <button
                    onClick={handleOpenCartModal}
                    className="flex items-center gap-2.5 hover:text-blue"
                    aria-label="سبد خرید"
                  >
                    <span className="inline-block relative">
                      <ShoppingCartIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-blue" />
                      <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-blue w-4.5 h-4.5 rounded-full text-white">
                        {product.length}
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="block text-2xs text-dark-4 uppercase">سبد خرید</span>
                      <p className="font-medium text-custom-sm text-dark">تومان{totalPrice}</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Hamburger Toggle BTN */}
              <button
                id="Toggle"
                aria-label="Toggler"
                className="xl:hidden block"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <span className="block relative cursor-pointer w-5.5 h-5.5">
                  <span className="du-block absolute right-0 w-full h-full">
                    <span
                      className={`block bg-dark rounded-sm w-0 h-0.5 my-1 duration-200 ${
                        !navigationOpen && "!w-full delay-300"
                      }`}
                    ></span>
                    <span
                      className={`block bg-dark rounded-sm w-0 h-0.5 my-1 duration-200 ${
                        !navigationOpen && "!w-full delay-400"
                      }`}
                    ></span>
                    <span
                      className={`block bg-dark rounded-sm w-0 h-0.5 my-1 duration-200 ${
                        !navigationOpen && "!w-full delay-500"
                      }`}
                    ></span>
                  </span>
                  <span className="block absolute right-0 w-full h-full rotate-45">
                    <span
                      className={`block bg-dark rounded-sm duration-200 absolute left-2.5 top-0 w-0.5 h-full ${
                        !navigationOpen && "!h-0"
                      }`}
                    ></span>
                    <span
                      className={`block bg-dark rounded-sm duration-200 absolute left-0 top-2.5 w-full h-0.5 ${
                        !navigationOpen && "!h-0"
                      }`}
                    ></span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* header top end */}
      </div>

      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            {/* Main Nav */}
            <div
              className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between ${
                navigationOpen &&
                `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
              }`}
            >
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  {menuData.map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown key={i} menuItem={menuItem} stickyMenu={stickyMenu} />
                    ) : (
                      <li
                        key={i}
                        className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full"
                      >
                        <Link
                          href={menuItem.path}
                          className={`hover:text-blue text-custom-sm font-medium text-dark flex ${
                            stickyMenu ? "xl:py-4" : "xl:py-6"
                          }`}
                        >
                          {menuItem.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>

            {/* Nav Right نمونه */}
            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5">
                <li className="py-4">
                  <a
                    href="#"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-dark hover:text-blue"
                  >
                    <EyeIcon className="w-5 h-5 text-dark" />
                    اخیرا مشاهده شده
                  </a>
                </li>
                <li className="py-4">
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-dark hover:text-blue"
                  >
                    <HeartIcon className="w-5 h-5 text-dark" />
                    لیست علاقه‌مندی‌ها
                  </Link>
                </li>
              </ul>
            </div>
            {/* Nav Right End */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;