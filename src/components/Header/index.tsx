"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { menuData } from "./menuData";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import {
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL


const Header = () => {
  const [stickyMenu, setStickyMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { isCartModalOpen, toggleCartModal } = useCartModalContext();
  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // دریافت دسته‌بندی‌ها از API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}${CATEGORYS_URL}`);
      const result = await res.json();
      if (result.success) setCategories(result.data);
    } catch (error) { console.error(error); }
  }, []);

  // بررسی وضعیت لاگین
const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();

      // حالت اول: کاربر ادمین است (آبجکت user وجود دارد)
      if (res.ok && data.user) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
      } 
      // حالت دوم: کاربر لاگین کرده اما ادمین نیست (role: "user" در بدنه دیتا برمی‌گردد)
      else if (data.role === "user") {
        setIsLoggedIn(true);
        // چون در این حالت API دیتای کامل کاربر را نمی‌دهد، یک نام پیش‌فرض می‌گذاریم
        setCurrentUser({ name: "کاربر عادی", role: "user" });
      } 
      // حالت سوم: توکن یافت نشد یا خطا (کاربر لاگین نیست)
      else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("خطا در تایید هویت:", error);
      setIsLoggedIn(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, [pathname, checkAuth, fetchCategories]);

  useEffect(() => {
    const handleScroll = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // هندل کردن خروج با SweetAlert2
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "خروج از حساب",
      text: "آیا برای خروج از حساب کاربری اطمینان دارید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "بله، خارج شو",
      cancelButtonText: "انصراف",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const res = await fetch("/api/auth/logout");
      if (res.ok) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        toast.success("با موفقیت خارج شدید");
        setMobileMenuOpen(false);
        router.push("/");
        router.refresh();
      }
    }
  };

  return (
    <header className={`fixed left-0 top-0 w-full z-[9999] bg-white transition-all duration-300 ${stickyMenu ? "shadow-md" : ""}`}>
      
      {/* ردیف اصلی: لوگو و ابزارهای کناری */}
      <div className="max-w-[1170px] mx-auto px-4">
        <div className={`flex items-center justify-between transition-all ${stickyMenu ? "py-3" : "py-5"}`}>
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-dark" onClick={() => setMobileMenuOpen(true)}>
              <Bars3Icon className="w-8 h-8" />
            </button>
            <Link href="/">
              <Image src="/images/logo/logoAsoShno.png" alt="آسو شنو" width={140} height={40} className="w-auto h-10" />
            </Link>
          </div>

          {/* سرچ باکس دسکتاپ */}
          <div className="hidden lg:flex flex-1 max-w-[450px] mx-10">
            <div className="relative w-full group">
              <input type="text" placeholder="جستجو در محصولات..." className="w-full bg-gray-1 border border-gray-3 rounded-full py-2.5 pr-4 pl-12 text-sm focus:border-blue outline-none transition-all" />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-4 group-focus-within:text-blue" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* پروفایل دسکتاپ با استایل Pill مورد علاقه شما */}
            <div className="hidden sm:flex items-center">
  {!authChecked ? (
    // در حال بررسی وضعیت توکن (اسکلتون یا لودینگ کوچک)
    <div className="w-24 h-8 bg-gray-2 animate-pulse rounded-full" />
  ) : isLoggedIn ? (
    // کاربر لاگین است (چه ادمین چه یوزر)
    <div className="flex items-center gap-3 bg-gray-1 p-1 pr-4 rounded-full border border-gray-2 shadow-sm">
      <span className="text-xs font-bold text-dark">{currentUser?.name}</span>
      <Link href="/my-account">
        <UserCircleIcon className="w-8 h-8 text-blue hover:scale-110 transition-transform" />
      </Link>
      <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red transition-colors">
        <ArrowLeftOnRectangleIcon className="w-6 h-6" />
      </button>
    </div>
  ) : (
    // کاربر اصلاً لاگین نکرده است
    <Link href="/signin" className="flex items-center gap-2 bg-gray-1 px-4 py-2 rounded-full border border-gray-2 text-sm font-bold text-dark hover:text-blue transition-all">
      <UserIcon className="w-5 h-5" />
      <span>ورود | عضویت</span>
    </Link>
  )}
</div>

            {/* دکمه سبد خرید */}
            <button 
              id="cart-button" 
              onClick={(e) => { e.stopPropagation(); toggleCartModal(); }}
              className={`cart-button-header relative flex items-center gap-2 p-2.5 lg:px-5 rounded-full transition-all ${isCartModalOpen ? 'bg-blue text-white shadow-lg' : 'bg-dark text-white hover:bg-blue'}`}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              <div className="hidden lg:block text-right">
                <p className="text-[10px] opacity-80 leading-none">سبد خرید</p>
                <p className="text-sm font-bold mt-0.5">{totalPrice.toLocaleString()} ت</p>
              </div>
              <span className="absolute -top-1 -right-1 bg-blue text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                {product.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* نوار منو دسکتاپ */}
      <div className="hidden lg:block border-t border-gray-3 bg-white">
        <div className="max-w-[1170px] mx-auto px-4 flex items-center justify-between">
            <nav className="flex items-center gap-8">
              {/* بخش دسته‌بندی کالاها */}
              <div className="relative border-l border-gray-3 ml-2 pl-8 py-4">
                <button 
                  onMouseEnter={() => setCatMenuOpen(true)}
                  onMouseLeave={() => setCatMenuOpen(false)}
                  className="flex items-center gap-2 text-dark font-bold text-sm hover:text-blue"
                >
                  <Squares2X2Icon className="w-5 h-5 text-blue" />
                  دسته‌بندی‌ها
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${catMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <div 
                  onMouseEnter={() => setCatMenuOpen(true)}
                  onMouseLeave={() => setCatMenuOpen(false)}
                  className={`absolute top-full right-0 w-64 bg-white shadow-2xl border-t-2 border-blue transition-all z-999 ${catMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"}`}
                >
                  <ul className="py-2">
                    {categories.map((cat) => (
                      <li key={cat._id}><Link href={`/category/${cat.slug || cat._id}`} className="block px-6 py-3 text-sm text-dark hover:bg-gray-1 hover:text-blue font-bold">{cat.title || cat.name}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* منوهای اصلی */}
              {menuData.map((item, index) => (
                <div key={index} className="relative group py-4">
                  <Link href={item.path} className={`flex items-center gap-1 text-sm font-bold transition-all ${pathname === item.path ? "text-blue" : "text-dark hover:text-blue"}`}>
                    {item.title}
                    {item.submenu && <ChevronDownIcon className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />}
                  </Link>
                  {item.submenu && (
                    <div className="absolute top-full right-0 w-52 bg-white shadow-xl border-t-2 border-blue opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-3 group-hover:translate-y-0 z-999">
                      <ul className="py-2">
                        {item.submenu.map((sub: any, i: number) => (
                          <li key={i}><Link href={sub.path} className="block px-5 py-2.5 text-xs font-bold text-dark hover:bg-gray-1 hover:text-blue">{sub.title}</Link></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </nav>
        </div>
      </div>

      {/* 📱 منوی موبایل (طراحی Pill-Style برای پروفایل) */}
      <div className={`fixed inset-0 bg-dark/60 backdrop-blur-sm z-[100000] lg:hidden transition-all ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`fixed top-0 right-0 h-full w-[310px] bg-white z-[100001] lg:hidden transition-all duration-400 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <Image src="/images/logo/logoAsoShno.png" alt="Logo" width={100} height={30} />
               <XMarkIcon className="w-8 h-8 text-dark p-1 bg-white rounded-full shadow-sm" onClick={() => setMobileMenuOpen(false)} />
            </div>

            {/* پروفایل موبایل با استایل Pill مشابه دسکتاپ */}
            <div className="mb-6">
              {isLoggedIn ? (
                <div className="flex items-center justify-between bg-white p-2 pr-4 rounded-full border border-gray-200 shadow-sm">
                  <Link href="/my-account" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-dark">{currentUser?.name}</span>
                      <span className="text-[9px] text-blue">پنل کاربری</span>
                    </div>
                    <UserCircleIcon className="w-10 h-10 text-blue" />
                  </Link>
                  <button onClick={handleLogout} className="p-2.5 bg-red/10 text-red rounded-full">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3 bg-dark text-white p-3.5 rounded-full font-bold text-sm shadow-lg shadow-dark/20">
                  <UserIcon className="w-5 h-5" />
                  ورود یا عضویت در سایت
                </Link>
              )}
            </div>

            {/* سرچ باکس موبایل */}
            <div className="relative">
              <input type="text" placeholder="چی لازم داری؟ جستجو کن..." className="w-full bg-white border border-gray-200 rounded-full py-3 pr-5 pl-12 text-xs outline-none focus:border-blue shadow-inner" />
              <MagnifyingGlassIcon className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* محتوای منوی موبایل */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-blue font-bold text-[11px] mb-4 flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5" /> دسته‌بندی محصولات
            </p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {categories.map((cat) => (
                <Link key={cat._id} href={`/category/${cat.slug || cat._id}`} className="bg-gray-1 p-3 rounded-xl text-[10px] text-center font-bold text-dark border border-gray-2" onClick={() => setMobileMenuOpen(false)}>
                  {cat.title || cat.name}
                </Link>
              ))}
            </div>

            <nav className="space-y-2">
              {menuData.map((item, index) => (
                <div key={index} className="border-b border-gray-50 last:border-0 pb-1">
                  <div 
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold ${pathname === item.path ? 'text-blue bg-blue/5' : 'text-dark'}`}
                    onClick={() => item.submenu && setActiveSubmenu(activeSubmenu === index ? null : index)}
                  >
                    <Link href={item.path} onClick={() => !item.submenu && setMobileMenuOpen(false)}>{item.title}</Link>
                    {item.submenu && <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeSubmenu === index ? 'rotate-180' : 'opacity-20'}`} />}
                  </div>
                  {item.submenu && activeSubmenu === index && (
                    <div className="pr-4 py-2 flex flex-col gap-3">
                      {item.submenu.map((sub: any, i: number) => (
                        <Link key={i} href={sub.path} onClick={() => setMobileMenuOpen(false)} className="text-xs text-gray-500 font-bold hover:text-blue pr-3 border-r-2 border-gray-100">
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;