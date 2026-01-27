"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // 👈 برای تشخیص صفحه فعلی
import Link from "next/link";
import {
  HomeIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentIcon,
  ChartPieIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  TagIcon,
  PencilSquareIcon,
  QrCodeIcon,
  TicketIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

// ✅ ساختار دیتا را استاندارد کردیم (پشتیبانی از فرزندان)
const menuItems = [
  { name: "بازگشت", icon: ArrowLeftIcon, href: "/" },
  { name: "داشبورد", icon: HomeIcon, href: "/my-account" }, // اصلاح لینک تستی
  {
    name: "محصول",
    icon: ArchiveBoxIcon,
    children: [
      { name: "افزودن محصول", href: "/panel/addProduct" },
      { name: "ویرایش محصول", href: "/panel/editProduct" },
    ],
  },
  {
    name: "بلاگ",
    icon: DocumentTextIcon,
    children: [
      { name: "افزودن بلاگ", href: "/panel/addBlog" },
      { name: "ویرایش بلاگ", href: "/panel/editBlog" },
    ],
  },
  {
    name: "یوزرها",
    icon: UsersIcon,
    children: [
      { name: "افزودن یوزر", href: "/panel/addUser" },
      { name: "ویرایش یوزر", href: "/panel/editUsers" },
    ],
  },
  {
    name: "دسته بندی",
    icon: TagIcon,
    children: [
      { name: "افزودن دسته بندی", href: "/panel/addCategorie" },
      { name: "ویرایش دسته بندی", href: "/panel/editCategorie" },
    ],
  },
  {
    name: "جدول نمودار",
    icon: ChartBarIcon,
    children: [
      { name: "نمودار محصول", href: "/panel/chartproducts" },
      { name: "نمودار یوزر", href: "/panel/chartUsers" },
      { name: "نمودار بلاگ", href: "/panel/chartblogs" },
      { name: "نمودار فروش", href: "/panel/chartSales" },
    ],
  },
  {
    name: "ویرایش صفحه",
    icon: PencilSquareIcon,
    children: [
      { name: "ویرایش بنر اصلی", href: "/panel/editBennerHome" },
      { name: "ویرایش بنرکوچک", href: "/panel/editBennerHomeChild" },
      { name: "ویرایش بنر مشتریان", href: "/panel/customerPromoBanner" },
      { name: "ویرایش بنر تخفیف ویژه ", href: "/panel/longTermDiscountProduct" },
    ],
  },
  {
    name: "بارکد",
    icon: QrCodeIcon,
    children: [
      { name: "افزودن بارکد", href: "/panel/addQrCode" },
      { name: "ویرایش بارکدها", href: "/panel/editBennerHomeChild" }, // لینک تکراری بود در کد اصلی
    ],
  },
  {
    name: "کدهای تخفیف",
    icon: TicketIcon,
    children: [
      { name: "لیست تخفیف ها", href: "/panel/discountCode" },
    ],
  },
    {
    name: "تنضیمات",
    icon: AdjustmentsHorizontalIcon,
    children: [
      { name: "تنضیمات منو", href: "/panel/settingMenu" },
      { name: "تنضیمات ایکون های خدماتی", href: "/panel/settinIconsSupportid" },
      { name: "تنضیمات ارتباط باما", href: "/panel/contact" },
      { name: "تنضیمات لوگو و تصاویر", href: "/panel/settingLogo" },
    ],
  },
  { name: "تیم", icon: UsersIcon, href: "/panel/team" },
  { name: "پروژه‌ها", icon: FolderIcon, href: "/panel/projects" },
  { name: "تقویم", icon: CalendarIcon, href: "/panel/calendar" },
  { name: "مدارک", icon: DocumentIcon, href: "/panel/documents" },
  { name: "گزارش‌ها", icon: ChartPieIcon, href: "/panel/reports" },
];

const teamLinks = [
  { label: "H", name: "Heroicons" },
  { label: "T", name: "Tailwind Labs" },
  { label: "W", name: "Workcation" },
];

export default function Sidebar() {
  const pathname = usePathname(); // 📍 مسیر فعلی را می‌گیرد
  const [openMenus, setOpenMenus] = useState({}); // مدیریت منوهای باز

  // تابع برای باز/بسته کردن منوها
  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // ✅ افکت برای اینکه اگر داخل یک زیرمنو هستیم، منوی والدش خودکار باز بماند
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => child.href === pathname);
        if (isChildActive) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [pathname]);

  return (
    <aside className="flex flex-col h-screen bg-[#e4e5e7] w-64 text-gray-500 overflow-y-auto">
      {/* لوگو */}
      <div className="px-6 py-4 flex items-center shrink-0">
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="mr-2 font-bold text-gray-700">پنل مدیریت</span>
      </div>

      {/* منوی اصلی */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => {
          // بررسی فعال بودن لینک‌های ساده
          const isActive = pathname === item.href;

          // بررسی فعال بودن منوهای کشویی (اگر یکی از بچه‌هاش فعال باشه)
          const isParentActive = item.children && item.children.some((child) => child.href === pathname);

          // 🔹 رندر کردن منوهای کشویی (Dropdown)
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex w-full justify-between items-center px-4 py-2.5 rounded-lg transition-colors duration-200
                    ${isParentActive
                      ? "bg-white text-blue-600 shadow-sm font-medium" // استایل والد وقتی فرزندش فعاله
                      : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className={`w-5 h-5 ml-3 ${isParentActive ? "text-blue-600" : ""}`} />}
                    {item.name}
                  </div>
                  {openMenus[item.name] ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>

                {/* زیر منوها */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[item.name] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="mr-4 pl-2 space-y-1 border-r-2 border-gray-300 pr-2 my-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-all duration-200
                            ${isChildActive
                              ? "bg-blue-600 text-white shadow-md font-medium translate-x-1" // 🟢 استایل فرزند فعال (سبز/آبی)
                              : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                            }
                          `}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // 🔹 رندر کردن لینک‌های معمولی (بدون زیر منو)
          return (
            <Link
              key={item.name}
              href={item.href || "#"}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200
                ${isActive
                  ? "bg-blue-600 text-white shadow-md font-medium" // 🔵 استایل لینک ساده فعال
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }
              `}
            >
              {item.icon && <item.icon className="w-5 h-5 ml-3" />}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* قسمت تیم‌ها (فوتر سایدبار) */}
      <div className="px-6 py-4 mt-auto border-t border-gray-300">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">تیم‌ها</p>
        <div className="space-y-3">
          {teamLinks.map((team) => (
            <div key={team.name} className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-500 group-hover:border-blue-500 group-hover:text-blue-600 transition">
                {team.label}
              </span>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{team.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}