// app/discount-codes/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TicketIcon,
  TrashIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


import Swal from "sweetalert2";


/**
 * کامپوننت اصلی مدیریت کدهای تخفیف
 * عملیات CRUD کامل با اعتبارسنجی
 */
const DiscountCodesPage = () => {
  // State Management
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // API Base URL


  // URLS
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "/";
  const DISCOUNT_CODES_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_CODES_URL || "/api/discountCodes";


  /**
   * دریافت لیست کدهای تخفیف از API
   */
  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!BASE_URL || !DISCOUNT_CODES_URL) {
        setError("آدرس API کدهای تخفیف معتبر نیست. لطفاً تنظیمات را بررسی کنید.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}${DISCOUNT_CODES_URL}`);

      if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
      const data = await response.json();
      setDiscountCodes(data.data);
    } catch (err) {
      setError("خطا در اتصال به سرور. لطفا دوباره تلاش کنید.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * بررسی تکراری بودن کد تخفیف
   */
  const checkDuplicateCode = async (code, excludeId) => {
    try {
      const response = await fetch(`${BASE_URL}${DISCOUNT_CODES_URL}`);
      const data = await response.json();
      return data.data.some(item =>
        item.discountCode.toLowerCase() === code.toLowerCase() &&
        item._id !== excludeId
      );
    } catch (err) {
      console.error("Error checking duplicate:", err);
      return false;
    }
  };

  /**
   * ایجاد کد تخفیف جدید
   */
  const createDiscountCode = async (code) => {
    try {
      if (!BASE_URL || !DISCOUNT_CODES_URL) {
        setError("آدرس API کدهای تخفیف معتبر نیست. لطفاً تنظیمات را بررسی کنید.");
        return false;
      }

      const response = await fetch(`${BASE_URL}${DISCOUNT_CODES_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(code),
      });


      if (!response.ok) throw new Error("خطا در ایجاد کد تخفیف");

      const res = await response.json();
      setDiscountCodes(prev => [...prev, res.data]);

      showSuccess("کد تخفیف با موفقیت ایجاد شد");
      return true;
    } catch (err) {
      setError("خطا در ایجاد کد تخفیف");
      console.error("Create error:", err);
      return false;
    }
  };

  /**
   * ویرایش کد تخفیف
   */
  const updateDiscountCode = async (_id, updatedCode) => {
    try {
      if (!BASE_URL || !DISCOUNT_CODES_URL) {
        setError("آدرس API کدهای تخفیف معتبر نیست. لطفاً تنظیمات را بررسی کنید.");
        return false;
      }

      const response = await fetch(`${BASE_URL}${DISCOUNT_CODES_URL}/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCode),
      });


      if (!response.ok) throw new Error("خطا در ویرایش کد تخفیف");

      const updated = await response.json();
      setDiscountCodes(prev =>
        prev.map(code => code._id === _id ? updated.data : code)
      );
      showSuccess("کد تخفیف با موفقیت ویرایش شد");
      return true;
    } catch (err) {
      setError("خطا در ویرایش کد تخفیف");
      console.error("Update error:", err);
      return false;
    }
  };

  /**
   * حذف کد تخفیف
   */
  const deleteDiscountCode = async (_id) => {
    console.log(_id, '_id in delet item ');

    try {
      if (!BASE_URL || !DISCOUNT_CODES_URL) {
        setError("آدرس API کدهای تخفیف معتبر نیست. لطفاً تنظیمات را بررسی کنید.");
        return;
      }

      const response = await fetch(`${BASE_URL}${DISCOUNT_CODES_URL}/${_id}`, {
        method: "DELETE",
      });


      if (!response.ok) throw new Error("خطا در حذف کد تخفیف");

      setDiscountCodes(prev => prev.filter(code => code._id !== _id));
      showSuccess("کد تخفیف با موفقیت حذف شد");
    } catch (err) {
      setError("خطا در حذف کد تخفیف");
      console.error("Delete error:", err);
    }
  };

  /**
   * نمایش پیام موفقیت
   */
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * کپی کردن کد تخفیف
   */
  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(code);
      showSuccess("کد تخفیف کپی شد!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError("خطا در کپی کردن کد");
    }
  };

  /**
   * حذف کد با تایید
   */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این کد تخفیف به‌صورت دائمی حذف خواهد شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
      confirmButtonColor: "#dc2626", // قرمز
      cancelButtonColor: "#3b82f6",  // آبی
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        confirmBtn.style.backgroundColor = '#3085d6';
        confirmBtn.style.color = '#fff';
        cancelBtn.style.backgroundColor = '#d33';
        cancelBtn.style.color = '#fff';

        const hoverStyle = document.createElement('style');
        hoverStyle.innerHTML = `
                                      .swal2-confirm:hover { background-color: #256ab3 !important; }
                                      .swal2-cancel:hover { background-color: #a00 !important; }
                                    `;
        document.head.appendChild(hoverStyle);
      }

    });

    // اگر کاربر لغو کرد
    if (!result.isConfirmed) return;

    try {
      await deleteDiscountCode(id);

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "کد تخفیف با موفقیت حذف شد",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "در حذف کد تخفیف مشکلی پیش آمد",
      });
    }
  };



  // Load data on component mount
  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  /**
   * فیلتر کردن کدها بر اساس جستجو
   */
  const filteredCodes = discountCodes.filter(code =>
    code.discountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.money.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-1 via-white to-blue-light-5">
      {/* نوتیفیکیشن‌ها */}
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      {successMessage && <SuccessNotification message={successMessage} />}

      {/* Header Section */}
      <header className="bg-white border-b border-gray-3 sticky top-0 z-1 shadow-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            {/* عنوان و دکمه‌ها */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-light-5 to-blue-light-4 rounded-xl">
                  <TicketIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue" />
                </div>
                <div>
                  <h1 className="text-heading-6 sm:text-heading-4 font-bold text-dark">
                    مدیریت کدهای تخفیف
                  </h1>
                  <p className="text-custom-xs sm:text-custom-sm text-meta-4 mt-1">
                    {loading ? (
                      <span className="animate-pulse">در حال بارگذاری...</span>
                    ) : (
                      `${discountCodes.length} کد تخفیف ثبت شده`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {/* دکمه رفرش */}
                <button
                  onClick={fetchDiscountCodes}
                  disabled={loading}
                  className="p-3 bg-gray-2 hover:bg-gray-3 rounded-xl
                           transition-all duration-200 disabled:opacity-50"
                  title="بارگذاری مجدد"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-dark ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* دکمه ایجاد کد جدید */}
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingCode(null);
                  }}
                  className="group flex items-center justify-center gap-2 
                           bg-gradient-to-r from-blue to-blue-light text-white 
                           px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl
                           font-medium text-custom-sm sm:text-base
                           shadow-2 transition-all duration-300 
                           hover:shadow-3 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>کد تخفیف جدید</span>
                  <SparklesIcon className="w-4 h-4 animate-pulse" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta-4" />
                <input
                  type="text"
                  placeholder="جستجو کد تخفیف یا مبلغ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-gray-1 border border-gray-3 rounded-xl
                           text-custom-sm sm:text-base text-dark placeholder-meta-5
                           focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue-light-5
                           transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingState />
        ) : filteredCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCodes.map((code) => (
              <DiscountCard
                key={code._id}
                code={code}
                onCopy={copyToClipboard}
                onDelete={handleDelete}
                onEdit={(code) => {
                  setEditingCode(code);
                  setShowForm(true);
                }}
                isCopied={copiedId === code.discountCode}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            searchTerm={searchTerm}
            onCreateNew={() => setShowForm(true)}
          />
        )}
      </main>

      {/* فرم ایجاد/ویرایش */}
      {showForm && (
        <DiscountForm
          editingCode={editingCode}
          onClose={() => {
            setShowForm(false);
            setEditingCode(null);
          }}
          onSubmit={async (formData) => {
            // بررسی تکراری بودن کد
            const isDuplicate = await checkDuplicateCode(
              formData.discountCode,
              editingCode?._id
            );

            if (isDuplicate) {
              setError(`کد تخفیف "${formData.discountCode}" قبلاً ثبت شده است. لطفاً کد دیگری انتخاب کنید یا کد قبلی را منقضی کنید.`);
              return false;
            }

            let success = false;
            if (editingCode) {
              success = await updateDiscountCode(editingCode._id, formData);
            } else {
              const newCode = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData
              };
              success = await createDiscountCode(newCode);
            }

            if (success) {
              setShowForm(false);
              setEditingCode(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
};

/**
 * کامپوننت کارت نمایش کد تخفیف
 */
const DiscountCard = ({ code, onCopy, onDelete, onEdit, isCopied }) => {
  return (

    <div className="relative bg-white rounded-2xl shadow-2 hover:shadow-3 
                    transition-all duration-300 overflow-hidden group">
      {/* وضعیت فعال بودن */}
      <div className="absolute top-3 left-3">
        {code.isActive ? (
          <span className="px-3 py-1 text-custom-xs font-medium rounded-full 
                    bg-green-light-6 text-green-dark border border-green-light-3">
            فعال
          </span>
        ) : (
          <span className="px-3 py-1 text-custom-xs font-medium rounded-full 
                    bg-red-light-6 text-red-dark border border-red-light-3">
            غیر فعال
          </span>
        )}
      </div>

      {/* نوار بالای کارت */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue to-blue-light" />

      <div className="p-5 sm:p-6">
        {/* هدر کارت */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 bg-blue-light-5 rounded-xl shrink-0">
              <TicketIcon className="w-6 h-6 text-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-custom-xs text-meta-4 mb-1">کد تخفیف</p>
              <div className="flex items-center gap-2">
                <code className="text-custom-lg font-bold text-dark bg-gray-1 
                               px-3 py-1.5 rounded-lg truncate">
                  {code.discountCode}
                </code>
                <button
                  onClick={() => onCopy(code.discountCode)}
                  className="p-1.5 hover:bg-gray-2 rounded-lg transition-colors 
                           duration-200 shrink-0"
                  title="کپی کد"
                >
                  {isCopied ? (
                    <CheckIcon className="w-4 h-4 text-green" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4 text-meta-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>




        {/* مبلغ تخفیف */}
        <div className="p-4 bg-gradient-to-r from-green-light-6 to-green-light-5 rounded-xl mb-4">

          <div className="flex items-center justify-between">
            <span className="text-custom-sm text-meta-2">مبلغ تخفیف:</span>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green" />
              <span className="text-custom-lg font-bold text-green-dark">
                {code.money.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(code)}
            className="flex-1 flex items-center justify-center gap-2 
                     py-2.5 px-4 bg-blue-light-5 hover:bg-blue-light-4 
                     text-blue font-medium rounded-xl
                     transition-colors duration-200"
          >
            <PencilSquareIcon className="w-4 h-4" />
            <span className="text-custom-sm">ویرایش</span>
          </button>
          <button
            onClick={() => onDelete(code._id)}
            className="flex-1 flex items-center justify-center gap-2 
                     py-2.5 px-4 bg-red-light-5 hover:bg-red-light-4 
                     text-red font-medium rounded-xl
                     transition-colors duration-200"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="text-custom-sm">حذف</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * کامپوننت فرم ایجاد/ویرایش
 */
const DiscountForm = ({ editingCode, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    discountCode: editingCode?.discountCode || "",
    money: editingCode?.money || 0,
    moneyDisplay: editingCode?.money?.toLocaleString('fa-IR') || '0',
    isActive: editingCode?.isActive ?? true,
    hasActiveDate: !!editingCode?.activeDate,
    activeDate: editingCode?.activeDate || null,
  });

  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 🔹 اعتبارسنجی فوری
  React.useEffect(() => {
    const newErrors = {};

    // کد تخفیف
    if (!formData.discountCode.trim()) {
      newErrors.discountCode = "کد تخفیف الزامی است";
    }

    // مبلغ
    if (!formData.money || formData.money <= 0) {
      newErrors.money = "مبلغ تخفیف باید بیشتر از صفر باشد";
    }

    // تاریخ انقضا (خطای فوری)
    if (formData.hasActiveDate) {
      if (!formData.activeDate) {
        newErrors.activeDate = "لطفاً تاریخ و ساعت پایان اعتبار را انتخاب کنید";
      } else if (new Date(formData.activeDate) <= new Date()) {
        // 🔴 خطای فوری تاریخ گذشته
        newErrors.activeDate = "تاریخ انقضا باید بعد از الان باشد";
      }
    }

    setErrors(newErrors);
  }, [formData.discountCode, formData.money, formData.hasActiveDate, formData.activeDate]);

  const validateForm = () => Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // اگر خطا داریم submit نشود

    setIsSubmitting(true);

    const success = await onSubmit({
      discountCode: formData.discountCode.toUpperCase(),
      money: Number(formData.money),
      isActive: formData.isActive,
      activeDate: formData.hasActiveDate ? formData.activeDate : null,
    });

    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 🔹 مودال scrollable برای ارتفاع زیاد */}
      <div className="bg-white rounded-2xl shadow-3 w-full max-w-lg transform transition-all duration-300 sm:max-w-md
                      max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="flex items-center justify-between p-6 border-b border-gray-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-light-5 to-blue-light-4 rounded-xl">
              <TicketIcon className="w-6 h-6 text-blue" />
            </div>
            <h2 className="text-heading-6 font-bold text-dark">
              {editingCode ? 'ویرایش کد تخفیف' : 'ایجاد کد تخفیف جدید'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-5 h-5 text-meta-4" />
          </button>
        </div>

        {/* بدنه فرم */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* کد تخفیف */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              کد تخفیف <span className="text-red mr-1">*</span>
            </label>
            <input
              type="text"
              value={formData.discountCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                setFormData(prev => ({ ...prev, discountCode: value }));
              }}
              placeholder="مثال: SUMMER2024"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-gray-1 border rounded-xl
                ${errors.discountCode
                  ? 'border-red focus:border-red focus:ring-red-light-4'
                  : 'border-gray-3 focus:border-blue focus:ring-blue-light-5'}`}
            />
            {errors.discountCode && (
              <p className="text-red text-custom-xs mt-1 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.discountCode}
              </p>
            )}
          </div>

          {/* فعال/غیرفعال با checkbox */}
          <div className="flex items-center gap-3 bg-gray-1 border border-gray-3 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 accent-blue"
            />
            <span className="text-custom-sm font-medium text-dark">
              {formData.isActive ? 'کد تخفیف فعال است' : 'کد تخفیف غیر فعال است'}
            </span>
          </div>

          {/* فعال‌سازی تاریخ */}
          <div className="bg-gray-1 border border-gray-3 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasActiveDate}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    hasActiveDate: e.target.checked,
                    activeDate: e.target.checked ? prev.activeDate : null,
                  }))
                }
                className="w-5 h-5 accent-blue"
              />
              <span className="text-custom-sm font-medium text-dark">
                فعال‌سازی محدودیت زمانی
              </span>
            </label>

            {formData.hasActiveDate && (
              <div className="space-y-2">
                <p className="text-custom-xs text-meta-4">تاریخ و ساعت پایان اعتبار</p>
                <DatePicker
                  value={formData.activeDate}
                  onChange={(date) => {
                    const newDate = date?.toDate();
                    // 🔹 خطای فوری تاریخ گذشته
                    if (newDate && newDate <= new Date()) {
                      setErrors(prev => ({ ...prev, activeDate: "تاریخ انقضا باید بعد از الان باشد" }));
                    } else {
                      setErrors(prev => ({ ...prev, activeDate: undefined }));
                    }
                    setFormData(prev => ({ ...prev, activeDate: newDate }));
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD HH:mm"
                  plugins={[<TimePicker position="bottom" />]}
                  inputClass="w-full px-4 py-3 bg-white border border-gray-3 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-blue-light-5"
                  minDate={new Date()}
                />
                {errors.activeDate && (
                  <p className="text-red text-custom-xs mt-1 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.activeDate}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* مبلغ تخفیف */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              مبلغ تخفیف (تومان) <span className="text-red mr-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.moneyDisplay}
                onFocus={() => {
                  if (formData.moneyDisplay === '0') setFormData(prev => ({ ...prev, moneyDisplay: '' }));
                }}
                onBlur={() => {
                  const raw = parseInt(formData.moneyDisplay.replace(/,/g, ''), 10) || 0;
                  setFormData(prev => ({
                    ...prev,
                    money: raw,
                    moneyDisplay: raw.toLocaleString('fa-IR'),
                  }));
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, moneyDisplay: value }));
                }}
                placeholder="مثال: 50,000"
                disabled={isSubmitting}
                className={`w-full pl-12 pr-4 py-3 bg-gray-1 border rounded-xl
                  ${errors.money
                    ? 'border-red focus:border-red focus:ring-red-light-4'
                    : 'border-gray-3 focus:border-blue focus:ring-blue-light-5'}`}
              />
              <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta-4" />
            </div>
            {errors.money && (
              <p className="text-red text-custom-xs mt-1 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.money}
              </p>
            )}
          </div>

          {/* پیش‌نمایش */}
          {formData.discountCode && formData.money > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-light-6 to-green-light-5 rounded-xl border border-green-light-3">
              <p className="text-custom-xs text-green-dark mb-2">پیش‌نمایش:</p>
              <div className="flex items-center justify-between">
                <code className="text-custom-lg font-bold text-green-dark bg-white/50 px-3 py-1 rounded">
                  {formData.discountCode.toUpperCase()}
                </code>
                <span className="text-custom-sm font-medium text-green-dark">
                  {formData.money.toLocaleString('fa-IR')} تومان تخفیف
                </span>
              </div>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-2 hover:bg-gray-3 text-dark font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0} // 🔴 disable وقتی خطا داریم
              className={`flex-1 py-3 px-4 bg-gradient-to-r from-blue to-blue-light text-white font-medium rounded-xl shadow-2 
                          hover:shadow-3 hover:scale-[1.01] transition-all duration-300 active:scale-[0.99]
                          disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <span>{editingCode ? 'ذخیره تغییرات' : 'ایجاد کد تخفیف'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};





/**
 * کامپوننت نمایش حالت خالی
 */
const EmptyState = ({ searchTerm, onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-light-5 rounded-full animate-pulse blur-xl" />
        <div className="relative bg-gradient-to-br from-gray-2 to-gray-3 rounded-full p-8 sm:p-10">
          <TicketIcon className="w-16 h-16 sm:w-20 sm:h-20 text-meta-4" />
        </div>
      </div>

      <h3 className="text-custom-1 sm:text-heading-5 font-semibold text-dark mb-3">
        {searchTerm ? 'نتیجه‌ای یافت نشد!' : 'هنوز کد تخفیفی ثبت نشده!'}
      </h3>
      <p className="text-custom-sm sm:text-base text-meta-4 mb-8 max-w-md text-center">
        {searchTerm
          ? `کد تخفیفی با عبارت "${searchTerm}" پیدا نشد.`
          : 'اولین کد تخفیف خود را ایجاد کنید و به مشتریان خود هدیه دهید'
        }
      </p>

      {!searchTerm && (
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-gradient-to-r from-blue to-blue-light 
                   text-white px-6 py-3.5 rounded-xl font-medium
                   shadow-2 hover:shadow-3 hover:scale-[1.02] 
                   transition-all duration-300 active:scale-[0.98]"
        >
          <PlusIcon className="w-5 h-5" />
          <span>ایجاد اولین کد تخفیف</span>
        </button>
      )}
    </div>
  );
};

/**
 * کامپوننت Loading State
 */
const LoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-2 p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-3 rounded-xl" />
            <div className="flex-1">
              <div className="h-4 bg-gray-3 rounded w-1/3 mb-2" />
              <div className="h-6 bg-gray-3 rounded w-2/3" />
            </div>
          </div>
          <div className="h-20 bg-gray-2 rounded-xl mb-4" />
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-3 rounded-xl" />
            <div className="flex-1 h-10 bg-gray-3 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * کامپوننت نوتیفیکیشن خطا
 */
const ErrorNotification = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 
                    bg-red-light-6 border border-red-light-3 rounded-xl p-4 
                    shadow-3 z-50 animate-slideDown">
      <div className="flex items-start gap-3">
        <XCircleIcon className="w-6 h-6 text-red shrink-0" />
        <div className="flex-1">
          <p className="text-custom-sm font-medium text-red-dark">خطا</p>
          <p className="text-custom-xs text-meta-3 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-red-light-5 rounded-lg transition-colors duration-200"
        >
          <XMarkIcon className="w-4 h-4 text-red" />
        </button>
      </div>
    </div>
  );
};

/**
 * کامپوننت نوتیفیکیشن موفقیت
 */
const SuccessNotification = ({ message }) => {
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 
                    bg-green-light-6 border border-green-light-3 rounded-xl p-4 
                    shadow-3 z-50 animate-slideDown">
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="w-6 h-6 text-green" />
        <p className="text-custom-sm font-medium text-green-dark">{message}</p>
      </div>
    </div>
  );
};

export default DiscountCodesPage;