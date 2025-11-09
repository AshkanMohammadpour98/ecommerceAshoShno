"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// ================== Helpers ==================
const generateInvoiceId = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

// تبدیل ارقام فارسی/عربی به لاتین
const toEnglishDigits = (s = "") =>
  String(s)
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));

// تاریخ جلالیِ الان با ارقام لاتین
const getNowJalali = () =>
  toEnglishDigits(
    new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD")
  );

// فقط رقم + تبدیل به لاتین
const onlyDigitsEnglish = (val = "") => toEnglishDigits(val).replace(/\D/g, "");

// ===================================================

export default function AddUserForm() {
  const router = useRouter();

  // روش ثبت‌نام: "phone" | "email"
  const [registerMethod, setRegisterMethod] = useState("phone");

  const [formData, setFormData] = useState({
    id: Date.now().toString(),
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    dateLogin: "",
    address: "",
    img: "",
    SuggestedCategories: [],
    PurchasedProducts: [],
    purchaseInvoice: [{ id: generateInvoiceId(), countProducts: 0 }],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [enableProducts, setEnableProducts] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categories, setCategories] = useState([]); // فقط name
  const [imagePreview, setImagePreview] = useState("");

  // --------------------- افکت‌ها ---------------------
  useEffect(() => {
    // گرفتن دسته‌بندی‌ها
    fetch("http://localhost:3001/categories")
      .then((resCate) => resCate.json())
      .then((dataCate) => setCategories((dataCate || []).map((c) => c.name)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // گرفتن محصولات فقط وقتی لازم شد
    if (!enableProducts) return;
    setLoadingProducts(true);
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data || []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [enableProducts]);

  useEffect(() => {
    // پاک‌سازی blob URL قبلی
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // --------------------- هندلرها ---------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: onlyDigitsEnglish(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryName) => {
    setFormData((prev) =>
      prev.SuggestedCategories.includes(categoryName)
        ? {
          ...prev,
          SuggestedCategories: prev.SuggestedCategories.filter((c) => c !== categoryName),
        }
        : { ...prev, SuggestedCategories: [...prev.SuggestedCategories, categoryName] }
    );
  };

  const handleProductToggle = (product) => {
    setFormData((prev) => {
      const exists = prev.PurchasedProducts.find((p) => p.id === product.id);
      const invId = prev.purchaseInvoice?.[0]?.id || generateInvoiceId();

      if (exists) {
        const updatedProducts = prev.PurchasedProducts.filter((p) => p.id !== product.id);
        return {
          ...prev,
          PurchasedProducts: updatedProducts,
          purchaseInvoice: [{ id: invId, countProducts: updatedProducts.length }],
        };
      } else {
        const updatedProducts = [
          ...prev.PurchasedProducts,
          {
            ...product,
            dateSlase: getNowJalali(), // تاریخ امروز با ارقام لاتین
          },
        ];
        return {
          ...prev,
          PurchasedProducts: updatedProducts,
          purchaseInvoice: [{ id: invId, countProducts: updatedProducts.length }],
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // پاک‌سازی آدرس قبلی
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, img: url }));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, img: "" }));
  };

  // --------------------- اعتبارسنجی ---------------------
  const validate = () => {
    if (!formData.name.trim()) return { ok: false, msg: "نام الزامی است" };
    if (!formData.lastName.trim()) return { ok: false, msg: "نام خانوادگی الزامی است" };
    if (formData.password.length < 6)
      return { ok: false, msg: "رمز عبور باید حداقل ۶ کاراکتر باشد" };

    if (registerMethod === "phone") {
      const phone = onlyDigitsEnglish(formData.phone);
      if (!phone) return { ok: false, msg: "شماره تلفن الزامی است" };
      if (!(phone.length === 11 && phone.startsWith("09")))
        return { ok: false, msg: "شماره تلفن نامعتبر است (مثال: 09123456789)" };
    } else {
      if (!formData.email.trim() || !formData.email.includes("@"))
        return { ok: false, msg: "ایمیل نامعتبر است" };
    }

    return { ok: true };
  };

  const buildRegisterWith = (phoneVal, emailVal) => {
    // فقط روش انتخابی + پسورد
    const arr = [];
    if (registerMethod === "phone") {
      arr.push({ phone: phoneVal });
    } else {
      arr.push({ email: emailVal });
    }
    arr.push({ password: formData.password });
    return arr;
  };

  // --------------------- ارسال ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    if (!v.ok) {
      Swal.fire({
        icon: "error",
        title: "خطا در فرم",
        text: v.msg,
          timer: 2000, // مودال بعد از 2000 میلی‌ثانیه (2 ثانیه) بسته می‌شود
  timerProgressBar: true, // نمایش نوار پیشرفت تایمر
  showConfirmButton: false,
  showCancelButton: false,
  showCloseButton: false
      });
      return;
    }

    const purchaseCount = formData.PurchasedProducts.length;

    // مقدار نهایی phone/email در سطح ریشه (مطابق خواسته شما)
    const phoneFinal = registerMethod === "phone" ? onlyDigitsEnglish(formData.phone) : "";
    const emailFinal = registerMethod === "email" ? formData.email : "";

    const payload = {
      id: formData.id,
      name: formData.name,
      lastName: formData.lastName,
      dateLogin: formData.dateLogin ? toEnglishDigits(formData.dateLogin) : getNowJalali(),
      // مهم: هر دو در ریشه وجود دارند؛ اما یکی از آنها رشته خالی است
      phone: phoneFinal,
      email: emailFinal,
      registerWith: buildRegisterWith(phoneFinal, emailFinal),
      SuggestedCategories: formData.SuggestedCategories,
      PurchasedProducts: (formData.PurchasedProducts || []).map((p) => ({
        ...p,
        dateSlase: toEnglishDigits(p.dateSlase || ""),
      })),
      purchaseInvoice: [{ id: generateInvoiceId(), countProducts: purchaseCount }],
      img: formData.img || "", // اختیاری
      address: formData.address || "", // اختیاری
    };

    try {
      const res = await fetch("http://localhost:3001/usersData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
 icon: "success",
  title: "موفقیت!",
  text: "کاربر با موفقیت اضافه شد ✅",
  timer: 2000, // مودال بعد از 2000 میلی‌ثانیه (2 ثانیه) بسته می‌شود
  timerProgressBar: true, // نمایش نوار پیشرفت تایمر
  showConfirmButton: false,
  showCancelButton: false,
  showCloseButton: false
        });

        // ریست فرم
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview("");
        setEnableProducts(false);
        setRegisterMethod("phone");
        setFormData({
          id: Date.now().toString(),
          name: "",
          lastName: "",
          phone: "",
          email: "",
          password: "",
          dateLogin: "",
          address: "",
          img: "",
          SuggestedCategories: [],
          PurchasedProducts: [],
          purchaseInvoice: [{ id: generateInvoiceId(), countProducts: 0 }],
        });

        router.push("/panel/editUsers");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطا!",
          text: "خطا در ارسال داده ❌",
          confirmButtonColor: "#F23030",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "warning",
        title: "مشکل شبکه!",
        text: "ارتباط با سرور برقرار نشد ⚡",
        confirmButtonColor: "#F59E0B",
      });
    }
  };

  // --------------------- UI ---------------------
  return (
    <div className="max-w-4xl w-full h-screen overflow-y-auto mx-auto p-6 bg-white shadow-2 rounded-xl mt-6">
      <h2 className="text-dark text-xl font-bold mb-6 text-center">افزودن کاربر جدید</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* آواتار + انتخاب تصویر (اختیاری) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-gray-3 flex items-center justify-center bg-gray-1 overflow-hidden">
            {formData.img ? (
              <img src={formData.img || null} alt="پیش‌نمایش" className="w-full h-full object-cover" />
            ) : (
              <UserCircleIcon className="w-10 h-10 text-blue" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="avatar"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-3 text-dark bg-white hover:bg-gray-1 transition cursor-pointer"
            >
              <PhotoIcon className="w-5 h-5" />
              انتخاب تصویر (اختیاری)
            </label>
            <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            {formData.img && (
              <button
                type="button"
                onClick={clearImage}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-3 text-red bg-white hover:bg-red hover:text-white transition"
                aria-label="حذف تصویر"
              >
                <XMarkIcon className="w-5 h-5" />
                حذف
              </button>
            )}
          </div>
        </div>

        {/* نام و نام خانوادگی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">نام</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">نام خانوادگی</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            />
          </div>
        </div>

        {/* انتخاب روش ثبت‌نام */}
        <div>
          <p className="block text-sm font-medium text-dark mb-2">روش ثبت‌نام</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRegisterMethod("phone")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${registerMethod === "phone"
                  ? "bg-blue text-white border-blue"
                  : "bg-gray-1 border-gray-3 text-dark hover:bg-gray-2"
                }`}
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
              موبایل
            </button>
            <button
              type="button"
              onClick={() => setRegisterMethod("email")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${registerMethod === "email"
                  ? "bg-blue text-white border-blue"
                  : "bg-gray-1 border-gray-3 text-dark hover:bg-gray-2"
                }`}
            >
              <EnvelopeIcon className="w-4 h-4" />
              ایمیل
            </button>
          </div>
        </div>

        {/* فیلدهای روش ثبت‌نام + پسورد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {registerMethod === "phone" ? (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-dark mb-1">تلفن</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={registerMethod === "phone"}
                inputMode="numeric"
                dir="ltr"
                placeholder="09123456789"
                className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
          ) : (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-dark mb-1">ایمیل</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={registerMethod === "email"}
                placeholder="example@mail.com"
                className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-1">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full rounded-md border border-gray-3 pr-3 pl-10 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                className="absolute inset-y-0 left-3 flex items-center text-gray-6 hover:text-dark transition"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* تاریخ ثبت‌نام */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">تاریخ ثبت‌نام</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            digits={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
            value={
              formData.dateLogin
                ? new DateObject({ date: formData.dateLogin, calendar: persian })
                : ""
            }
            onChange={(date) => {
              if (date) {
                setFormData((prev) => ({
                  ...prev,
                  dateLogin: toEnglishDigits(date.format("YYYY/MM/DD")),
                }));
              } else {
                setFormData((prev) => ({ ...prev, dateLogin: "" }));
              }
            }}
            placeholder="تاریخ را انتخاب کنید"
          />
          {formData.dateLogin && (
            <p className="mt-2 text-xs text-gray-5">تاریخ انتخاب‌شده: {formData.dateLogin}</p>
          )}
        </div>

        {/* آدرس (اختیاری) */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">آدرس (اختیاری)</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            placeholder="شهر، خیابان، پلاک ..."
          />
        </div>

        {/* دسته‌بندی‌های پیشنهادی */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">دسته‌بندی‌های پیشنهادی</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-full border text-sm transition ${formData.SuggestedCategories.includes(cat)
                    ? "bg-blue text-white border-blue"
                    : "bg-gray-1 border-gray-3 text-dark hover:bg-gray-2"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* فعال‌سازی محصولات خریداری‌شده */}
        <div className="flex items-center gap-3 bg-gray-1 p-3 rounded-md border border-gray-3">
          <input
            id="enableProducts"
            type="checkbox"
            checked={enableProducts}
            onChange={(e) => setEnableProducts(e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-[#3C50E0]"
          />
          <label htmlFor="enableProducts" className="text-sm font-medium text-dark cursor-pointer">
            افزودن محصولات خریداری شده برای این کاربر
          </label>
        </div>

        {/* بخش محصولات */}
        {enableProducts && (
          <div className="rounded-md border border-gray-3 p-4 bg-gray-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-dark text-sm">انتخاب محصولات</h3>
              <span className="text-xs text-gray-6">
                {formData.PurchasedProducts.length} محصول انتخاب شده
              </span>
            </div>

            {loadingProducts ? (
              <p className="text-gray-6 text-sm">در حال بارگذاری محصولات...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allProducts.map((product) => {
                  const isSelected = formData.PurchasedProducts.find((p) => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`p-3 border rounded-md cursor-pointer transition ${isSelected
                          ? "bg-blue text-white border-blue"
                          : "bg-white border-gray-3 hover:bg-gray-2"
                        }`}
                      onClick={() => handleProductToggle(product)}
                    >
                      <p className="font-medium text-sm">{product.title}</p>
                      <p className="text-xs opacity-75">قیمت: {product.price}$</p>
                      {product.hasDiscount && (
                        <p className={`text-xs ${isSelected ? "text-white" : "text-yellow-dark"}`}>
                          با تخفیف 🎉 {product.discountedPrice}$
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-green text-white font-semibold hover:bg-green-dark transition"
        >
          ذخیره کاربر
        </button>
      </form>
    </div>
  );
}