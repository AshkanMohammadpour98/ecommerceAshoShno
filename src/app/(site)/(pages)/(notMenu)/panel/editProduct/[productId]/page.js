"use client";

import { useState, useEffect, use } from "react";
// import { categories } from "@/app/api/categories/route";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function EditProductId({ params }) {
    // unwrap params using React.use
  const unwrappedParams = use(params);
  const productId = unwrappedParams.productId;

    const [categories, setCategories] = useState([]);

    
  const [formData, setFormData] = useState(null);
  const router = useRouter();

  // دریافت اطلاعات محصول برای پر کردن فرم
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/products/${productId}`);
        const data = await res.json();
            // گرفتن دسته‌بندی‌ها
    fetch("http://localhost:3001/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
        setFormData(data);
      } catch (error) {
        console.error("خطا در دریافت محصول:", error);
      }
    };
    fetchProduct();
  }, [productId]);
  // console.log(formData);
  

  if (!formData) return <p className="text-center">در حال بارگذاری...</p>;

   // تغییر ورودی‌ها
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // شرط خاص برای تیک تخفیف
    if (name === "hasDiscount") {
      setFormData((prev) => ({
        ...prev,
        hasDiscount: checked,
        discountedPrice: checked ? prev.discountedPrice : 0, // اگه تیک برداشته شد، قیمت تخفیف صفر بشه
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };


  // تغییر عکس‌ها
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      newImgs[type][index] = imageUrl;
      return { ...prev, imgs: newImgs };
    });
  };

  // ثبت تغییرات
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.price || !formData.reviews) {
      Swal.fire({
        title: "خطا",
        text: "لطفاً همه فیلدهای الزامی را پر کنید ❌",
        icon: "error",
      });
      return;
    }

    const product = {
      ...formData,
      reviews: Number(formData.reviews),
      price: Number(formData.price),
      discountedPrice: Number(formData.discountedPrice),
      hasDiscount: formData.discountedPrice ? true : false,
    };

    try {
      const res = await fetch(`http://localhost:3001/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${product.title} با موفقیت ویرایش شد `,
          showConfirmButton: false,
          timer: 1500,
        });
        router.replace("/");
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
      className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 max-h-screen overflow-y-auto"
    >
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-2">
        ویرایش محصول
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
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Reviews */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          امتیاز
        </label>
        <input
          type="number"
          name="reviews"
          value={formData.reviews}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* قیمت و تخفیف */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">قیمت</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full mt-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            name="hasDiscount"
            checked={formData.hasDiscount === true}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600"
          />
          <label className="ml-2 text-sm text-gray-700">افزودن تخفیف</label>
        </div>

        {formData.hasDiscount === true && (
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-400"
          />
        )}
      </div>

      {/* دسته‌بندی */}
      <div>
        <label className="text-sm font-semibold text-gray-600 mb-2">
          دسته‌بندی:
        </label>
        <select
          name="categorie"
          value={formData.categorie}
          onChange={handleChange}
          className="border rounded-xl px-4 py-2"
        >
          {categories.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Thumbnails */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          Thumbnails
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {formData.imgs.thumbnails.map((thumb, i) => (
            <div
              key={i}
              className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center"
            >
              {thumb && (
                <img
                  src={thumb || null}
                  alt="thumb"
                  className="w-24 h-24 object-cover rounded-lg mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "thumbnails", i)}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Previews */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          Previews
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {formData.imgs.previews.map((prev, i) => (
            <div
              key={i}
              className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center"
            >
              {prev && (
                <img
                  src={prev || null}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "previews", i)}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
      {/* دکمه ذخیره */}
      <button
        type="submit"
        className="w-full bg-[#232936] text-white py-3 rounded-xl font-semibold hover:bg-dark transition"
      >
        ذخیره تغییرات
      </button>

    </form>
  );
}
