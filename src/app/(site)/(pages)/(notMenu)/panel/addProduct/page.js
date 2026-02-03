"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    title: "",
    reviews: "",
    price: "",
    discountedPrice: "",
    hasDiscount: false,
    categorie: "",
    count: 1,
    date: "",
    condition: "نو آکبند", // 🟢 فیلد condition اضافه شد
    description: { short: "", full: "" }, // 🟢 content به description.short & description.full تبدیل شد
    imgs: { thumbnails: [null, null], previews: [null, null] },
  });

  const [id] = useState(() => String(Date.now()));
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // URLs
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

  // 🟢 دریافت دسته‌بندی‌ها هنگام لود فرم
  useEffect(() => {
    fetch(`${BASE_URL}${CATEGORYS_URL}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  // 📌 تغییر فیلدهای فرم
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    // 🟢 پشتیبانی از checkbox
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📌 تغییر description.short و description.full
  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [name]: value },
    }));
  };

  // 📌 آپلود تصاویر
  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => {
      const newImgs = { ...prev.imgs };
      newImgs[type][index] = file; // ذخیره فایل واقعی
      return { ...prev, imgs: newImgs };
    });
  };

  // 📌 ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, price, reviews, categorie, imgs, date, description } =
      formData;

    // ولیدیشن
    if (
      !title ||
      !price ||
      !reviews ||
      !categorie ||
      !date ||
      !description.short ||
      !description.full
    ) {
      Swal.fire({
        icon: "warning",
        title: "لطفا همه فیلدها را پر کنید",
      });
      return;
    }

    if (
      imgs.thumbnails.some((img) => !img) ||
      imgs.previews.some((img) => !img)
    ) {
      Swal.fire({
        icon: "warning",
        title: "لطفا همه تصاویر محصول را انتخاب کنید",
      });
      return;
    }

    try {
      const form = new FormData();

      // 🟢 فیلدهای پایه
      form.append("id", id);
      form.append("title", formData.title);
      form.append("categorie", formData.categorie);
      form.append("date", formData.date);
      form.append("price", formData.price);
      form.append("reviews", formData.reviews);
      form.append("count", formData.count);
      form.append("hasDiscount", formData.hasDiscount);
      form.append(
        "discountedPrice",
        formData.hasDiscount ? formData.discountedPrice : ""
      );

      // 🟢 فیلدهای جدید
      form.append("condition", formData.condition);
      form.append("descriptionShort", formData.description.short);
      form.append("descriptionFull", formData.description.full);

      // 🟢 ارسال تصاویر
      formData.imgs.thumbnails.forEach((file) =>
        form.append("thumbnails", file)
      );
      formData.imgs.previews.forEach((file) => form.append("previews", file));

      // ذخیره محصول
      const resProduct = await fetch(`${BASE_URL}${PRODUCTS_URL}`, {
        method: "POST",
        body: form,
      });

      if (!resProduct.ok) throw new Error("افزودن محصول انجام نشد");

      // افزایش تعداد محصولات دسته‌بندی
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.categorie
      );
      if (selectedCategory) {
        await fetch(`${BASE_URL}${CATEGORYS_URL}/${selectedCategory._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: (selectedCategory.products ?? 0) + 1,
          }),
        });
      }

      await Swal.fire({
        icon: "success",
        title: "محصول با موفقیت اضافه شد!",
        showConfirmButton: false,
        timer: 1500,
      });

      // ریست فرم
      setFormData({
        title: "",
        reviews: "",
        price: "",
        discountedPrice: "",
        hasDiscount: false,
        categorie: "",
        count: 1,
        date: "",
        condition: "نو آکبند",
        description: { short: "", full: "" },
        imgs: { thumbnails: [null, null], previews: [null, null] },
      });

      router.push("/panel/editProduct");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطا!",
        text: error.message || "افزودن محصول انجام نشد",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 max-h-screen overflow-y-auto"
    >
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-2">
        افزودن محصول
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
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />
      </div>

      {/* توضیحات کوتاه و کامل */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          توضیح کوتاه
        </label>
        <input
          type="text"
          name="short"
          value={formData.description.short}
          onChange={handleDescriptionChange}
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />
        <label className="block text-sm font-semibold text-gray-600 mt-2">
          توضیح کامل
        </label>
        <textarea
          name="full"
          value={formData.description.full}
          onChange={handleDescriptionChange}
          required
          className="w-full mt-1 border rounded-xl px-4 py-2 min-h-[100px]"
        />
      </div>

      {/* فیلد condition */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          وضعیت محصول
        </label>
        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2"
        >
          <option value="نو آکبند">نو آکبند</option>
          <option value="استوک">استوک</option>
          <option value="در حد نو">در حد نو</option>
          <option value="کارکرده">کارکرده</option>
        </select>
      </div>

      {/* امتیاز */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          Reviews (امتیاز)
        </label>
        <input
          type="number"
          name="reviews"
          value={formData.reviews}
          onChange={handleChange}
          min="0"
          max="5"
          step="0.1"
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />
      </div>

      {/* تعداد */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          تعداد محصول
        </label>
        <input
          type="number"
          name="count"
          value={formData.count}
          onChange={handleChange}
          min="1"
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />
      </div>

      {/* قیمت + تخفیف */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">
          قیمت
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          required
          className="w-full mt-1 border rounded-xl px-4 py-2"
        />

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            name="hasDiscount"
            checked={formData.hasDiscount}
            onChange={handleChange}
          />
          <label className="ml-2 text-sm text-gray-700">دارای تخفیف</label>
        </div>

        {formData.hasDiscount && (
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            min="0"
            className="w-full mt-2 border rounded-xl px-4 py-2"
          />
        )}
      </div>

      {/* تاریخ */}
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={formData.date}
        onChange={(d) =>
          setFormData((p) => ({ ...p, date: d?.format("YYYY/MM/DD") }))
        }
        inputClass="w-full border rounded-xl px-4 py-2 text-center"
      />

      {/* دسته بندی */}
      <select
        name="categorie"
        value={formData.categorie}
        onChange={handleChange}
        className="border rounded-xl px-4 py-2"
      >
        <option value="">-- انتخاب کنید --</option>
        {categories.map((item) => (
          <option key={item._id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      {/* تصاویر */}
      {["thumbnails", "previews"].map((type) => (
        <div key={type}>
          <div className="grid grid-cols-2 gap-4">
            {formData.imgs[type].map((file, i) => (
              <div
                key={i}
                className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center"
              >
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-24 h-24 object-cover mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, type, i)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-[#232936] text-white py-3 rounded-xl font-semibold"
      >
        ذخیره محصول
      </button>
    </form>
  );
}
