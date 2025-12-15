"use client";

import { useState, useEffect, use } from "react"; // 1. اضافه کردن use و اصلاح تایپو useEffect
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function EditProductId({ params }) {
  // 2. باز کردن params با استفاده از use (مخصوص Next.js 15)
  const resolvedParams = use(params);
  const _id = resolvedParams._id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(null);
  const router = useRouter();

  // دریافت اطلاعات محصول و دسته‌بندی‌ها
  // دریافت اطلاعات محصول و دسته‌بندی‌ها
  useEffect(() => {
    const fetchData = async () => {
      // استفاده از use برای باز کردن params در ابتدای کامپوننت انجام شده است
      if (!_id) return;

      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(`http://localhost:3000/api/products/${_id}`),
          fetch("http://localhost:3000/api/categorys")
        ]);

        if (!productRes.ok) throw new Error("خطا در دریافت محصول");
        
        const productJson = await productRes.json(); // کل جیسون دریافتی: { data: {...} }
        
        const categoryJson = await categoryRes.json();

        // اصلاح مهم: دسترسی به دیتای داخل آبجکت data
        // اگر API شما { data: {...} } برمی‌گرداند، باید productJson.data را ست کنید
        const actualProductData = productJson.data || productJson; 
        console.log(productJson.data , "دیتای محصول دریافتی...");

        setFormData(productJson.data);
        setCategories(categoryJson.data || []);
        
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("خطا", "در دریافت اطلاعات مشکلی پیش آمد", "error");
      }
    };

    fetchData();
  }, [_id]);

  if (!formData) return <p className="text-center mt-10">در حال بارگذاری...</p>;

  // تغییر ورودی‌ها
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "hasDiscount") {
      setFormData((prev) => ({
        ...prev,
        hasDiscount: checked,
        discountedPrice: checked ? prev.discountedPrice : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  console.log("form data : " + formData);
  

  // ⚠️ نکته مهم درباره عکس‌ها (در توضیحات پایین بخوانید)
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // اینجا فقط پیش‌نمایش لوکال می‌سازیم
    const imageUrl = URL.createObjectURL(file);

    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      // کپی آرایه برای جلوگیری از تغییر مستقیم state
      const newArray = [...newImgs[type]];
      newArray[index] = imageUrl; 
      
      return { 
        ...prev, 
        imgs: {
            ...newImgs,
            [type]: newArray
        }
      };
    });
  };

  // ثبت تغییرات
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.price) {
      Swal.fire({
        title: "خطا",
        text: "لطفاً فیلدهای الزامی را پر کنید ❌",
        icon: "error",
      });
      return;
    }

    const product = {
      ...formData,
      reviews: Number(formData.reviews),
      price: Number(formData.price),
      discountedPrice: Number(formData.discountedPrice),
      hasDiscount: !!formData.discountedPrice, // تبدیل مطمئن به boolean
    };

    try {
      const res = await fetch(`http://localhost:3000/api/products/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "ویرایش با موفقیت انجام شد",
          showConfirmButton: false,
          timer: 1500,
        });
        router.push("/panel/editProduct"); // ریدایرکت به صفحه لیست
        router.refresh(); // رفرش برای دیدن اطلاعات جدید
      } else {
        Swal.fire("خطا", "ویرایش محصول انجام نشد ❌", "error");
      }
    } catch (error) {
      console.error("مشکل در ارسال:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 mb-20"
    >
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-2">
        ویرایش محصول: {formData.title}
      </h2>

      {/* عنوان */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          عنوان محصول
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* Reviews */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          امتیاز (Reviews)
        </label>
        <input
          type="number"
          name="reviews"
          value={formData.reviews}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* قیمت و تخفیف */}
      <div className="bg-gray-50 p-4 rounded-xl border">
        <label className="block text-sm font-semibold text-gray-600">قیمت اصلی</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <div className="flex items-center mt-4 mb-2">
          <input
            type="checkbox"
            name="hasDiscount"
            id="hasDiscount"
            checked={!!formData.hasDiscount}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 cursor-pointer"
          />
          <label htmlFor="hasDiscount" className="mr-2 text-sm text-gray-700 cursor-pointer select-none">افزودن تخفیف</label>
        </div>

        {formData.hasDiscount && (
          <div>
             <label className="block text-sm font-semibold text-green-600">قیمت با تخفیف</label>
            <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleChange}
                className="w-full mt-1 border border-green-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
        )}
      </div>

      {/* دسته‌بندی */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          دسته‌بندی:
        </label>
        <select
          name="category" // دقت کنید نام فیلد در دیتابیس چیست (categorie یا category)
          value={formData.category || formData.categorie || ""}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none bg-white"
        >
          <option value="">انتخاب کنید...</option>
          {categories.map((item, index) => (
            <option key={index} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Thumbnails */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          تصاویر کوچک (Thumbnails)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.imgs?.thumbnails?.map((thumb, i) => (
            <div
              key={i}
              className="border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center hover:border-blue-400 transition"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt="thumb"
                  className="w-20 h-20 object-contain rounded-lg mb-2"
                />
              ) : (
                <span className="text-xs text-gray-400 mb-2">خالی</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "thumbnails", i)}
                className="text-xs w-full max-w-[150px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Previews */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          تصاویر اصلی (Previews)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.imgs?.previews?.map((prev, i) => (
            <div
              key={i}
              className="border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center hover:border-blue-400 transition"
            >
              {prev ? (
                <img
                  src={prev}
                  alt="preview"
                  className="w-24 h-24 object-contain rounded-lg mb-2"
                />
              ) : (
                <span className="text-xs text-gray-400 mb-2">خالی</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "previews", i)}
                className="text-xs w-full max-w-[150px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* دکمه ذخیره */}
      <button
        type="submit"
        className="w-full bg-blue-dark text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg mt-6"
      >
        ذخیره تغییرات
      </button>

    </form>
  );
}