"use client";

import React, { useState, useEffect, useCallback } from "react";

// ------- TYPES BASED ON YOUR DATA -------
interface QRConfig {
  value: string;
  ecc: string;
  colors: { fg: string; bg: string };
}

interface QRData {
  id: string;
  name: string;
  config: { v: number } & QRConfig;
  preview: { url: string; width: number; height: number; mime: string };
  dateAddQrCode: string;
}

interface ProductImages {
  thumbnails: string[];
  previews: string[];
}

interface PurchasedProduct {
  id: string;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  categorie: string;
  date: string; // dateSlase in parent, mapped here for convenience
  imgs: ProductImages;
  hasDiscount: boolean;
  QRDatas?: QRData;
}

interface UserData {
  _id: string;
  id: string;
  name: string;
  lastName: string;
  gender: string;
  role: string;
  dateLogin: string;
  phone: string;
  email: string;
  password?: string;
  SuggestedCategories: string[];
  PurchasedProducts: PurchasedProduct[];
  purchaseInvoice: { id: string; countProducts: number }[];
  img: string;
  address: string;
}

interface MyAccountClientProps {
  user: UserData;
}

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

type TabKey = "dashboard" | "orders" | "downloads" | "addresses" | "account-details";

// ------- ICONS (SVG) --------
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  ),
  downloads: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
  ),
  addresses: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  account: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
  ),
};

const tabs = [
  { key: "dashboard", title: "داشبورد", icon: Icons.dashboard },
  { key: "orders", title: "سفارش‌ها", icon: Icons.orders },
  { key: "downloads", title: "کدهای دیجیتال (QR)", icon: Icons.downloads },
  { key: "addresses", title: "آدرس‌ها", icon: Icons.addresses },
  { key: "account-details", title: "جزئیات حساب", icon: Icons.account },
];

// ------- MODAL COMPONENT --------
const AddressModal: React.FC<AddressModalProps> = ({ isOpen, closeModal }) => {
  const handleOutside = useCallback(
    (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".modal-content")) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, handleOutside]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex justify-center items-center z-99999">
      <div className="modal-content bg-white dark:bg-dark-2 p-8 rounded-xl shadow-2 w-full max-w-lg relative animate-fadeIn">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-body hover:text-red transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-heading-6 font-bold text-dark dark:text-white mb-6">افزودن آدرس جدید</h2>

        <form onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">نام گیرنده</label>
              <input type="text" className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue focus:shadow-input transition-all bg-gray-1" placeholder="مثال: سامان" />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">آدرس کامل</label>
              <textarea className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue focus:shadow-input transition-all bg-gray-1" rows={3} placeholder="آدرس خود را وارد کنید..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">شماره تماس</label>
              <input type="tel" className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue focus:shadow-input transition-all bg-gray-1" placeholder="09xxxxxxxxx" />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue hover:bg-blue-dark text-white font-medium px-6 py-3 rounded-lg mt-6 w-full transition-colors shadow-1"
          >
            ذخیره آدرس
          </button>
        </form>
      </div>
    </div>
  );
};

// ------- MAIN COMPONENT --------
const MyAccountClient: React.FC<MyAccountClientProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to format price
  const formatPrice = (price: number) => price.toLocaleString();

  return (
    <section className="mt-52 sm:mt-30 md:mt-34 lg:mt-36 xl:mt-40 bg-gray-1 min-h-screen py-10 px-4 md:px-6" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-1">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-light-5 flex items-center justify-center text-blue text-2xl font-bold uppercase overflow-hidden">
                    {user.img ? <img src={user.img} alt={user.name} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-heading-6 font-bold text-dark">سلام، {user.name} {user.lastName} 👋</h1>
                    <p className="text-body text-sm mt-1">{user.email}</p>
                </div>
            </div>
            <div className="mt-4 md:mt-0 text-right md:text-left">
                <span className="inline-block bg-green-light-6 text-green-dark px-3 py-1 rounded-full text-xs font-semibold">
                    {user.role === 'user' ? 'کاربر عادی' : 'مدیر'}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ---- Sidebar Navigation ---- */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-2 overflow-hidden sticky top-4">
              <nav className="flex flex-col p-2">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as TabKey)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeTab === t.key
                        ? "bg-blue text-white shadow-1"
                        : "text-body hover:bg-gray-1 hover:text-dark"
                    }`}
                  >
                    <span>{t.icon}</span>
                    {t.title}
                  </button>
                ))}
                <div className="h-px bg-gray-2 my-2 mx-4"></div>
                <button className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-red hover:bg-red-light-6 transition-all duration-200 text-sm font-medium">
                    {Icons.logout}
                    خروج از حساب
                </button>
              </nav>
            </div>
          </aside>

          {/* ---- Main Content ---- */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-2 p-6 md:p-8 min-h-[500px]">
              
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-heading-5 font-bold text-dark mb-4">داشبورد شما</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-blue-light-5 p-5 rounded-xl border border-blue-light-4">
                        <span className="text-blue text-3xl font-bold block mb-1">{user.PurchasedProducts.length}</span>
                        <span className="text-body text-sm">سفارش‌های تکمیل شده</span>
                    </div>
                    <div className="bg-yellow-light-2 p-5 rounded-xl border border-yellow-light-1">
                        <span className="text-yellow-dark-2 text-3xl font-bold block mb-1">{user.purchaseInvoice.length}</span>
                        <span className="text-body text-sm">فاکتورهای پرداخت شده</span>
                    </div>
                     <div className="bg-green-light-6 p-5 rounded-xl border border-green-light-4">
                        <span className="text-green-dark text-3xl font-bold block mb-1">{user.dateLogin.split('/')[2]}</span>
                        <span className="text-body text-sm">روز عضویت در ماه جاری</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-dark mb-3">آخرین خریدها</h3>
                    {user.PurchasedProducts.length > 0 ? (
                         <div className="overflow-x-auto">
                         <table className="w-full text-right text-sm text-body">
                             <thead className="bg-gray-1 text-dark font-medium">
                                 <tr>
                                     <th className="px-4 py-3 rounded-r-lg">محصول</th>
                                     <th className="px-4 py-3">تاریخ</th>
                                     <th className="px-4 py-3">قیمت</th>
                                     <th className="px-4 py-3 rounded-l-lg">وضعیت</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {user.PurchasedProducts.slice(0,3).map((prod) => (
                                     <tr key={prod.id} className="border-b border-gray-2 last:border-0">
                                         <td className="px-4 py-4 font-medium text-dark">{prod.title}</td>
                                         <td className="px-4 py-4">{prod.date}</td>
                                         <td className="px-4 py-4">{formatPrice(prod.discountedPrice || prod.price)} $</td>
                                         <td className="px-4 py-4">
                                            <span className="bg-green-light-6 text-green-dark px-2 py-1 rounded text-xs">تکمیل شده</span>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                    ) : (
                        <p className="text-body">هیچ خریدی انجام نشده است.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-heading-6 font-bold text-dark mb-6">لیست سفارش‌های من</h2>
                  <div className="flex flex-col gap-4">
                    {user.PurchasedProducts.map((product) => (
                        <div key={product.id} className="flex flex-col sm:flex-row gap-5 border border-gray-2 rounded-xl p-4 hover:shadow-1 transition-all bg-white">
                            <div className="w-full sm:w-32 h-32 bg-gray-1 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={product.imgs.thumbnails[0]} alt={product.title} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-dark line-clamp-1">{product.title}</h3>
                                        <span className="text-xs bg-blue-light-5 text-blue px-2 py-1 rounded">{product.categorie}</span>
                                    </div>
                                    <p className="text-sm text-body mt-2">تاریخ خرید: {product.date}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < product.reviews ? 'text-yellow' : 'text-gray-4'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex flex-col">
                                        {product.hasDiscount && <span className="text-xs text-red line-through decoration-red">{formatPrice(product.price)} $</span>}
                                        <span className="text-xl font-bold text-dark">{formatPrice(product.discountedPrice)} $</span>
                                    </div>
                                    <button className="text-blue text-sm font-medium hover:underline">مشاهده فاکتور</button>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DOWNLOADS / QR TAB */}
              {activeTab === "downloads" && (
                <div className="space-y-6 animate-fadeIn">
                   <h2 className="text-heading-6 font-bold text-dark mb-4">کدهای دیجیتال (QR)</h2>
                   <p className="text-body text-sm mb-6">محصولاتی که دارای کد QR اختصاصی هستند در اینجا نمایش داده می‌شوند.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.PurchasedProducts.filter(p => p.QRDatas).map((product) => (
                            <div key={`qr-${product.id}`} className="border border-gray-3 rounded-xl p-5 flex flex-col items-center text-center bg-gray-1/30">
                                <h4 className="font-bold text-dark mb-2">{product.title}</h4>
                                <div className="bg-white p-3 rounded-lg shadow-1 border border-gray-2 mb-4">
                                     <img src={product.QRDatas?.preview.url} alt="QR Code" className="w-40 h-40 object-contain" />
                                </div>
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-body">شناسه:</span>
                                        <span className="font-mono text-dark font-medium">{product.QRDatas?.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-body">لینک:</span>
                                        <a href={product.QRDatas?.config.value} target="_blank" className="text-blue truncate max-w-[150px] dir-ltr block">{product.QRDatas?.config.value}</a>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-body">تاریخ ایجاد:</span>
                                        <span className="text-dark">{product.QRDatas?.dateAddQrCode}</span>
                                    </div>
                                </div>
                                <button className="mt-4 w-full bg-blue text-white py-2 rounded-lg text-sm hover:bg-blue-dark transition-colors">دانلود تصویر QR</button>
                            </div>
                        ))}
                        {user.PurchasedProducts.filter(p => p.QRDatas).length === 0 && (
                            <div className="col-span-full text-center py-10">
                                <p className="text-body">هیچ محصول دیجیتالی یافت نشد.</p>
                            </div>
                        )}
                   </div>
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-heading-6 font-bold text-dark">آدرس‌های ثبت شده</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-dark transition-colors flex items-center gap-2 shadow-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                            افزودن آدرس
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-blue rounded-xl p-5 bg-blue-light-5/20 relative group">
                            <span className="absolute top-4 left-4 bg-blue text-white text-[10px] px-2 py-0.5 rounded-full">پیش‌فرض</span>
                            <h4 className="font-bold text-dark mb-2">منزل</h4>
                            <p className="text-body text-sm leading-relaxed mb-4">
                                {user.address}
                            </p>
                            <p className="text-dark text-sm font-medium mb-1">{user.phone}</p>
                            <p className="text-dark text-sm font-medium">{user.name} {user.lastName}</p>
                            
                            <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-blue text-sm hover:underline">ویرایش</button>
                                <button className="text-red text-sm hover:underline">حذف</button>
                            </div>
                        </div>
                    </div>

                    <AddressModal
                        isOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                    />
                </div>
              )}

              {/* ACCOUNT DETAILS TAB */}
              {activeTab === "account-details" && (
                <div className="animate-fadeIn">
                  <h2 className="text-heading-6 font-bold text-dark mb-6">ویرایش اطلاعات حساب</h2>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">نام</label>
                          <input type="text" defaultValue={user.name} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white focus:border-blue outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">نام خانوادگی</label>
                          <input type="text" defaultValue={user.lastName} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white focus:border-blue outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">شماره موبایل</label>
                          <input type="tel" defaultValue={user.phone} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white focus:border-blue outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">ایمیل</label>
                          <input type="email" defaultValue={user.email} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white focus:border-blue outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">جنسیت</label>
                          <select defaultValue={user.gender} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white focus:border-blue outline-none transition-all">
                              <option value="male">مرد</option>
                              <option value="female">زن</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-body">تاریخ ورود</label>
                          <input type="text" defaultValue={user.dateLogin} disabled className="w-full border border-gray-2 rounded-lg px-4 py-3 bg-gray-1 text-gray-5 cursor-not-allowed" />
                      </div>

                      <div className="col-span-1 md:col-span-2 mt-4">
                          <h3 className="font-bold text-dark mb-4">تغییر رمز عبور</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="password" placeholder="رمز عبور فعلی" className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:border-blue outline-none" />
                            <input type="password" placeholder="رمز عبور جدید" className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:border-blue outline-none" />
                            <input type="password" placeholder="تکرار رمز عبور جدید" className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:border-blue outline-none" />
                          </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                          <button type="button" className="bg-blue hover:bg-blue-dark text-white px-8 py-3 rounded-lg font-medium shadow-2 transition-all">
                              ذخیره تغییرات
                          </button>
                      </div>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MyAccountClient;