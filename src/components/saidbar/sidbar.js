// components/saidbar/sidbar.js
"use client";

import { useState } from "react";
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
  ArchiveIcon,
  DocumentTextIcon,
  TagIcon,
  PencilSquareIcon,
  QrCodeIcon,
  TicketIcon

} from "@heroicons/react/24/outline";
import Link from "next/link";

const mainLinks = [
  { name: "بازگشت", icon: ArrowLeftIcon, linkBtn: "/" },
  { name: "داشبورد", icon: HomeIcon, linkBtn: "/dashbord" },
  { name: "محصول", icon: ArchiveIcon },
  { name: "بلاگ", icon: DocumentTextIcon },
  { name: "یوزرها", icon: UsersIcon },
  { name: "دسته بندی", icon: TagIcon },
  { name: "جدول نمودار", icon: ChartBarIcon, linkBtn: "/" },
  { name: "ویرایش صفحه", icon: PencilSquareIcon, linkBtn: "/" },
  { name: "ًبارکد", icon: QrCodeIcon, linkBtn: "/" },
  { name: "کدهای تخفیف", icon: TicketIcon, linkBtn: "/" },
  { name: "تیم", icon: UsersIcon, linkBtn: "/" },
  { name: "پروژه‌ها", icon: FolderIcon, linkBtn: "/" },
  { name: "تقویم", icon: CalendarIcon, linkBtn: "/" },
  { name: "مدارک", icon: DocumentIcon, linkBtn: "/" },
  { name: "گزارش‌ها", icon: ChartPieIcon, linkBtn: "/" },
];

const teamLinks = [
  { label: "H", name: "Heroicons" },
  { label: "T", name: "Tailwind Labs" },
  { label: "W", name: "Workcation" },
];

export default function Sidebar() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDropdownBlog, setOpenDropdownBlog] = useState(false)
  const [openDropdownTabeleChart, setOpenDropdownTabeleChart] = useState(false)
  const [openDropdownUsers, setOpenDropdownUsers] = useState(false)
  const [openDropdownTag, setOpenDropdownTag] = useState(false)
  const [openDropdownEditSite, setOpenDropdownEditSite] = useState(false)
  const [openDropdownQrCode, setOpenDropdownQrCode] = useState(false)
  const [openDropdownTicket, setOpenDropdownTicket] = useState(false)

  return (
    <aside className="flex flex-col h-screen bg-[#e4e5e7] w-64 text-gray-300">
      {/* لوگو بالای سایدبار */}
      <div className="px-6 py-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 
            3.35 0a1.724 1.724 0 002.573 
            1.066c1.543-.94 3.31.826 
            2.37 2.37a1.724 1.724 0 
            001.065 2.572c1.756.426 
            1.756 2.924 0 3.35a1.724 
            1.724 0 00-1.066 2.573c.94 
            1.543-.826 3.31-2.37 
            2.37a1.724 1.724 0 
            00-2.572 1.065c-.426 
            1.756-2.924 1.756-3.35 
            0a1.724 1.724 0 
            00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 
            1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 
            0-3.35a1.724 1.724 0 
            001.066-2.573c-.94-1.543.826-3.31 
            2.37-2.37.996.608 2.296.07 
            2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      {/* منوی اصلی */}
      <nav className="flex-1 px-2 py-2 space-y-1">
        {mainLinks.map((link, idx) => {
          if (link.name === "محصول") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdown ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdown ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/addProduct"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      افزودن محصول
                    </Link>
                    <Link
                      href="/panel/editProduct"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش محصول
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "بلاگ") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownBlog(!openDropdownBlog)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownBlog ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownBlog ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/addBlog"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      افزودن بلاگ
                    </Link>
                    <Link
                      href="/panel/editBlog"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش بلاگ
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "جدول نمودار") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownTabeleChart(!openDropdownTabeleChart)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownTabeleChart ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownTabeleChart ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/chartproducts"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      نمودار محصول
                    </Link>
                    <Link
                      href="/panel/chartUsers"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      نمودار یوزر
                    </Link>
                    <Link
                      href="/panel/chartblogs"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      نمودار بلاگ
                    </Link>
                    <Link
                      href="/panel/editBlog"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      نمودار فروش
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "یوزرها") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownUsers(!openDropdownUsers)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownUsers ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownUsers ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/addUser"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      افزودن یوزر
                    </Link>
                    <Link
                      href="/panel/editUsers"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش یوزر
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "دسته بندی") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownTag(!openDropdownTag)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownTag ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownTag ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/addCategorie"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      افزودن دسته بندی
                    </Link>
                    <Link
                      href="/panel/editCategorie"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش دسته بندی
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "ویرایش صفحه") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownEditSite(!openDropdownEditSite)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownEditSite ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownEditSite ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/editBennerHome"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش بنر اصلی
                    </Link>
                    <Link
                      href="/panel/editBennerHomeChild"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش بنرکوچک
                    </Link>
                                        <Link
                      href="/panel/customerPromoBanner"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش بنر محصولات مشتریان
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "ًبارکد") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownQrCode(!openDropdownQrCode)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownQrCode ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownQrCode ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/addQrCode"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      افزودن بارکد
                    </Link>
                    <Link
                      href="/panel/editBennerHomeChild"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      ویرایش بارکدها
                    </Link>

                  </div>
                </div>
              </div>
            );
          }
          if (link.name === "کدهای تخفیف") {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setOpenDropdownTicket(!openDropdownTicket)}
                  className="flex w-full justify-between items-center px-4 py-2 rounded-lg hover:bg-[#232936] hover:text-white"
                >
                  <div className="flex items-center">
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.name}
                  </div>
                  {openDropdownTicket ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdownTicket ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-10 mt-1 space-y-1">
                    <Link
                      href="/panel/discountCode"
                      className="block px-3 py-1 rounded-md hover:bg-[#232936] hover:text-white"
                    >
                      لیست تخیف ها
                    </Link>

                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.linkBtn || "#"}
              className={`flex px-4 py-2 rounded-lg
                hover:bg-[#232936] hover:text-white
                ${idx === 0 ? "bg-[#232936] text-white font-semibold" : ""}
              `}
            >
              {link.icon && <link.icon className="w-5 h-5 mr-3" />}
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* قسمت تیم‌ها */}
      <div className="px-6 mt-10">
        <p className="text-xs font-semibold text-gray-400 mb-3">تیم‌های</p>
        <div className="space-y-2">
          {teamLinks.map((team) => (
            <div key={team.name} className="flex space-x-2">
              <span className="inline-flex justify-center h-6 w-6 rounded-full bg-[#232936] text-xs font-bold text-gray-400">
                {team.label}
              </span>
              <span className="text-sm text-gray-300">{team.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}