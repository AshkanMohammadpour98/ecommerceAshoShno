"use client";

import React, { useEffect, useState, useCallback } from "react";

// نوع تب‌ها برای تایپ بهتر
type TabKey = "dashboard" | "orders" | "downloads" | "addresses" | "account-details";

type TabItem = {
  key: TabKey;
  title: string;
  icon: React.ReactNode;
};

// تب‌ها + آیکون‌ها (می‌تونی SVGهای خودت رو جایگزین کنی)
const tabsData: TabItem[] = [
  {
    key: "dashboard",
    title: "داشبورد",
    icon: (
      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" />
        <rect x="12" y="12" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "orders",
    title: "سفارش‌ها",
    icon: (
      <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10l1 3h-12z" />
        <path d="M6 7h12l-1.5 10.5a2 2 0 0 1-2 1.5h-5a2 2 0 0 1-2-1.5z" />
      </svg>
    ),
  },
  {
    key: "downloads",
    title: "دانلودها",
    icon: (
      <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="17" width="16" height="3" rx="1.5"/>
      </svg>
    ),
  },
  {
    key: "addresses",
    title: "آدرس‌ها",
    icon: (
      <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3C8.7 3 6 5.7 6 9c0 5.25 6 12 6 12s6-6.75 6-12c0-3.3-2.7-6-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
      </svg>
    ),
  },
  {
    key: "account-details",
    title: "جزئیات حساب",
    icon: (
      <svg className="fill-current" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
      </svg>
    ),
  },
];

// Modal آدرس (در همین فایل)
type AddressModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, closeModal }) => {
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest(".modal-content")) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-dark/70 z-[9999] sm:py-20 xl:py-25 2xl:py-[230px] sm:px-8 px-4 py-5 overflow-y-auto">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={closeModal}
            aria-label="بستن مودال"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg className="fill-current" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
              />
            </svg>
          </button>

          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: اینجا لاجیک ذخیره آدرس رو اضافه کن
                closeModal();
              }}
            >
              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="name" className="block mb-2.5">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue="James Septimus"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="email" className="block mb-2.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue="jamse@example.com"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label htmlFor="phone" className="block mb-2.5">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue="1234 567890"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="address" className="block mb-2.5">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue="7398 Smoke Ranch Road, Las Vegas, Nevada 89128"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// روت اکانت (همه‌چیز اینجاست)
const MyAccount: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  return (
    <section className="py-10 bg-gray-2" dir="rtl">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* سایدبار تب‌ها */}
          <aside className="md:col-span-1">
            <div className="rounded-xl bg-white shadow-1 p-4">
              <ul className="space-y-1">
                {tabsData.map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-right ${
                        activeTab === tab.key
                          ? "bg-blue text-white"
                          : "hover:bg-gray-1"
                      }`}
                    >
                      <span className="text-dark-4">{tab.icon}</span>
                      <span className="flex-1">{tab.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* محتوای تب‌ها */}
          <div className="md:col-span-3">
            <div className="rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-10 min-h-[300px]">
              {activeTab === "dashboard" && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">داشبورد</h3>
                  <p className="text-dark-4">خوش آمدید! اینجا خلاصه‌ای از فعالیت‌های شما نمایش داده می‌شود.</p>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">سفارش‌ها</h3>
                  <p className="text-dark-4">لیست سفارش‌های شما در این بخش نمایش داده می‌شود.</p>
                </div>
              )}

              {activeTab === "downloads" && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">دانلودها</h3>
                  <p className="text-dark-4">دانلودهای در دسترس شما اینجا قرار می‌گیرد.</p>
                </div>
              )}

              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">آدرس‌ها</h3>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      افزودن آدرس
                    </button>
                  </div>
                  <p className="text-dark-4 mb-2">آدرس‌های ذخیره‌شده شما در این بخش نمایش داده می‌شود.</p>

                  {/* مودال آدرس */}
                  <AddressModal
                    isOpen={isAddressModalOpen}
                    closeModal={() => setIsAddressModalOpen(false)}
                  />
                </div>
              )}

              {activeTab === "account-details" && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">جزئیات حساب</h3>
                  <p className="text-dark-4">اطلاعات پروفایل و امکان ویرایش جزئیات حساب کاربری شما.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;