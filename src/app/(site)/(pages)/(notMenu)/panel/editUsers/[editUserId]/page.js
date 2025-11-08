"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// ============= تاریخ جلالی و ارقام لاتین ============
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const toLatinDigits = (val = "") => {
  const map = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  };
  return String(val).replace(/[۰-۹٠-٩]/g, (d) => map[d] || d);
};

const generateInvoiceId = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

const getNowJalaliLatin = () =>
  toLatinDigits(new DateObject({ calendar: persian }).format("YYYY/MM/DD"));

// Helpers: خواندن/ساختن registerWith
const pickFromRegisterWith = (arr = [], key) => {
  const item = arr.find((o) => Object.prototype.hasOwnProperty.call(o, key));
  return item ? item[key] : "";
};
const withoutKeysRegisterWith = (arr = [], keys = []) =>
  arr.filter((o) => !keys.some((k) => Object.prototype.hasOwnProperty.call(o, k)));
// ==============================================================================

export default function Page({ params }) {
  const userId = params.editUserId;
  const router = useRouter();

  // استیت‌ها
  const [formData, setFormData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // گرفتن اطلاعات کاربر از API
  useEffect(() => {
    fetch(`http://localhost:3000/usersData/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        // نرمال‌سازی داده‌ها + سنکرون کردن فاکتور
        const normalized = {
          ...data,
          SuggestedCategories: data.SuggestedCategories || [],
          PurchasedProducts: (data.PurchasedProducts || []).map((p) => ({
            ...p,
            dateSlase: p.dateSlase || p.date || "",
          })),
        };

        // ایمیل/پسورد از registerWith
        const email = pickFromRegisterWith(data.registerWith, "email");
        const password = pickFromRegisterWith(data.registerWith, "password");

        const invId = data.purchaseInvoice?.[0]?.id || generateInvoiceId();
        normalized.purchaseInvoice = [
          { id: invId, countProducts: normalized.PurchasedProducts.length },
        ];

        // افزودن فیلدهای کمکی برای بایند ورودی‌ها (ارسال نهایی دوباره داخل registerWith قرار می‌گیرن)
        setFormData({
          ...normalized,
          email,
          password,
          registerWith: data.registerWith || [],
        });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // گرفتن کل محصولات
  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data));
  }, []);

  // گرفتن دسته‌بندی‌ها
  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.map((c) => c.name)));
  }, []);

  // تغییر فیلدهای فرم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dateLogin" ? toLatinDigits(value) : value,
    }));
  };

  // مدیریت دسته‌بندی‌ها
  const handleCategoryChange = (category) => {
    setFormData((prev) =>
      prev.SuggestedCategories.includes(category)
        ? {
            ...prev,
            SuggestedCategories: prev.SuggestedCategories.filter((c) => c !== category),
          }
        : { ...prev, SuggestedCategories: [...prev.SuggestedCategories, category] }
    );
  };

  // اضافه/حذف محصول + تاریخ خرید + فاکتور
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
        const newItem = {
          ...product,
          dateSlase: getNowJalaliLatin(),
        };
        const updatedProducts = [...prev.PurchasedProducts, newItem];
        return {
          ...prev,
          PurchasedProducts: updatedProducts,
          purchaseInvoice: [{ id: invId, countProducts: updatedProducts.length }],
        };
      }
    });
  };

  // تغییر تاریخ خرید هر محصول
  const handleProductDateChange = (id, dateObjOrNull) => {
    setFormData((prev) => {
      const formatted = dateObjOrNull ? toLatinDigits(dateObjOrNull.format("YYYY/MM/DD")) : "";
      const updated = prev.PurchasedProducts.map((p) =>
        p.id === id ? { ...p, dateSlase: formatted } : p
      );
      return { ...prev, PurchasedProducts: updated };
    });
  };

  // تغییر قیمت قابل‌ویرایش
  const handleEditablePriceChange = (id, value, hasDiscount) => {
    setFormData((prev) => {
      const updated = prev.PurchasedProducts.map((p) =>
        p.id === id
          ? {
              ...p,
              [hasDiscount ? "discountedPrice" : "price"]: Number(value) || 0,
            }
          : p
      );
      return { ...prev, PurchasedProducts: updated };
    });
  };

  // ارسال ویرایش
  const handleSubmit = async (e) => {
    e.preventDefault();

    // بازسازی registerWith با ایمیل/پسورد جدید (حفظ سایر کلیدها مثل phone)
    const restRegisterWith = withoutKeysRegisterWith(formData.registerWith, ["email", "password"]);
    const newRegisterWith = [
      ...restRegisterWith,
      { email: formData.email ?? "" },
      { password: formData.password ?? "" },
    ];

    // ساخت payload منسجم
    const invId = formData.purchaseInvoice?.[0]?.id || generateInvoiceId();

    // حذف فیلدهای کمکی email/password از ریشه تا ساختار API حفظ شود
    // و استفاده از newRegisterWith
    const { email, password, ...rest } = formData;

    const payload = {
      ...rest,
      registerWith: newRegisterWith,
      dateLogin: toLatinDigits(formData.dateLogin || ""),
      purchaseInvoice: [{ id: invId, countProducts: formData.PurchasedProducts.length }],
      PurchasedProducts: (formData.PurchasedProducts || []).map((p) => ({
        ...p,
        dateSlase: toLatinDigits(p.dateSlase || ""),
      })),
    };

    try {
      const res = await fetch(`http://localhost:3000/usersData/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "اطلاعات کاربر ویرایش شد ✅",
          showConfirmButton: false,
          timer: 1500,
        });
        router.push("/panel/editUsers");
      } else {
        Swal.fire({ icon: "error", title: "خطا ❌", text: "ویرایش انجام نشد" });
      }
    } catch (err) {
      Swal.fire({ icon: "warning", title: "مشکل شبکه ⚡" });
    }
  };

  if (loading || !formData)
    return <p className="text-center mt-10 text-dark">در حال بارگذاری...</p>;

  // ------------------- UI -------------------
  return (
    <div className="max-w-4xl mx-auto p-6 h-screen overflow-y-auto bg-white shadow-2 rounded-xl mt-6">
      <h2 className="text-dark text-xl font-bold mb-6 text-center">✏️ ویرایش اطلاعات کاربر</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* مشخصات کاربر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-dark">نام</label>
            <input
              type="text"
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-dark">نام خانوادگی</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName ?? ""}
              onChange={handleChange}
              className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
            />
          </div>
        </div>

        {/* ایمیل از registerWith */}
        <div>
          <label className="text-sm font-medium text-dark">ایمیل</label>
          <input
            type="email"
            name="email"
            value={formData.email ?? ""}
            onChange={handleChange}
            className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
          />
        </div>
        {/* شماره تلفن  */}
                  <div>
            <label className="text-sm font-medium text-dark">شماره تلفن</label>
            <input
              type="number"
              name="phone"
              value={formData.phone ?? ""}
              onChange={handleChange}
              className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
            />
          </div>

        {/* رمز عبور با نمایش/پنهان‌سازی و استایل هماهنگ */}
        <div>
          <label className="text-sm font-medium text-dark">رمز عبور</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password ?? ""}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full border border-gray-3 rounded-md pr-3 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
              className="absolute inset-y-0 left-3 flex items-center text-gray-6 hover:text-dark transition"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1 text-2xs text-gray-5">برای مشاهده رمز، روی آیکن چشم کلیک کنید.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-dark">تاریخ ثبت نام</label>
          <input
            type="text"
            name="dateLogin"
            value={formData.dateLogin ?? ""}
            onChange={handleChange}
            placeholder="YYYY/MM/DD"
            className="w-full border border-gray-3 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
          />
          <p className="text-xs text-gray-5 mt-1">تاریخ این محصول</p>
        </div>

        {/* دسته‌بندی‌ها */}
        <div>
          <label className="block text-sm font-medium mb-2 text-dark">دسته‌بندی‌های پیشنهادی</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-full border text-sm transition ${
                  formData.SuggestedCategories.includes(cat)
                    ? "bg-blue text-white border-blue"
                    : "bg-gray-1 border-gray-3 text-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* اطلاعات خرید */}
        <div className="p-3 rounded-md border border-gray-3 bg-gray-1">
          <label className="block text-sm font-semibold mb-1 text-dark">اطلاعات خرید این کاربر</label>
          <p className="text-sm text-dark">
            تعداد محصولات خریداری‌شده:{" "}
            <span className="font-bold">
              {formData.purchaseInvoice?.[0]?.countProducts ?? formData.PurchasedProducts.length}
            </span>
          </p>
        </div>

        {/* محصولات خریداری شده */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-dark">🛒 محصولات خریداری شده</h3>
            <button
              type="button"
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="text-sm px-3 py-1 rounded-md bg-blue text-white hover:bg-blue-dark transition"
            >
              {showProductSelector ? "بستن انتخاب محصولات" : "افزودن محصول"}
            </button>
          </div>

          {/* لیست محصولات انتخاب شده */}
          <div className="space-y-3">
            {formData.PurchasedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 border border-gray-3 rounded-md flex flex-col gap-3 bg-gray-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-dark">{product.title}</p>
                    <div className="text-xs text-gray-6 space-x-2 space-x-reverse">
                      <span>قیمت اصلی: {product.price}$</span>
                      {product.hasDiscount && (
                        <span className="text-red">قیمت تخفیف: {product.discountedPrice}$ 🎉</span>
                      )}
                    </div>
                  </div>

                  {/* قیمت قابل ویرایش */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-dark">
                      {product.hasDiscount ? "ویرایش قیمت تخفیف:" : "ویرایش قیمت:"}
                    </label>
                    <input
                      type="number"
                      value={product.hasDiscount ? product.discountedPrice ?? 0 : product.price ?? 0}
                      onChange={(e) =>
                        handleEditablePriceChange(product.id, e.target.value, product.hasDiscount)
                      }
                      className="w-28 px-2 py-1 border border-gray-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue text-dark placeholder:body"
                    />
                  </div>
                </div>

                {/* ویرایش تاریخ خرید این محصول */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-dark">ویرایش تاریخ خرید این محصول:</label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                    digits={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]} // ارقام لاتین
                    value={
                      product.dateSlase
                        ? new DateObject({ date: product.dateSlase, calendar: persian })
                        : ""
                    }
                    onChange={(date) => handleProductDateChange(product.id, date)}
                    placeholder="YYYY/MM/DD"
                  />
                  {product.dateSlase && (
                    <span className="text-xs text-gray-5">ذخیره‌شده: {product.dateSlase}</span>
                  )}
                </div>

                {/* حذف از خریدها */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleProductToggle(product)}
                    className="text-xs text-red hover:underline"
                  >
                    حذف از خریدها
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* لیست کل محصولات برای افزودن */}
          {showProductSelector && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {allProducts.map((product) => {
                const isSelected = formData.PurchasedProducts.find((p) => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductToggle(product)}
                    className={`p-3 border border-gray-3 rounded-md cursor-pointer transition ${
                      isSelected ? "bg-blue text-white" : "bg-white"
                    }`}
                  >
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs">قیمت: {product.price}$</p>
                    {product.hasDiscount && (
                      <p className="text-xs text-yellow-dark">
                        تخفیف دارد 🎉 {product.discountedPrice}$
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* دکمه ذخیره */}
        <button
          type="submit"
          className="w-full py-2 rounded bg-green text-white font-semibold hover:bg-green-dark transition"
        >
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}