"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AddCategory() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    products: 0,
    img: "",
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [noImage, setNoImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categorys");
      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("خطا در دریافت دسته‌ها:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setFormData({ ...formData, img: localUrl });
    }
  };
  const handleNoImage = () => {
    setNoImage(!noImage);
    if (!noImage) {
      setPreview("/images/notImg.png");
      setFormData({ ...formData, img: "/images/notImg.png" });
    } else {
      setPreview(null);
      setFormData({ ...formData, img: "" });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      Swal.fire("خطا", "نام دسته‌بندی الزامی است", "error");
      return;
    }

    if (!formData.img) {
      Swal.fire("خطا", "لطفا یک تصویر انتخاب کنید یا گزینه بدون عکس را فعال کنید", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/categorys");
      const categories = await res.json();
      // console.log(categories.data  , "categories.data");


      const exists = categories.data.find(
        (cat) => cat.name.toLowerCase() === formData.name.toLowerCase()
      );
      console.log(exists);
      
      if (exists) {
        Swal.fire(
          "نام تکراری",
          "این نام دسته‌بندی از قبل وجود دارد. لطفا نام دیگری انتخاب کنید.",
          "warning"
        );
        setLoading(false);
        return;
      }

      if (exists) {
        Swal.fire(
          "نام تکراری",
          "این نام دسته‌بندی از قبل وجود دارد. لطفا نام دیگری انتخاب کنید.",
          "warning"
        );
        setLoading(false);
        return;
      }

      const newCategory = {
        ...formData,
        id: Math.random().toString(36).substr(2, 4),
      };

      await fetch("http://localhost:3000/api/categorys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      Swal.fire("موفق!", "دسته‌بندی با موفقیت اضافه شد", "success").then(() => {
        fetchCategories();
        setFormData({ name: "", products: 0, img: "" });
        setPreview(null);
        setNoImage(false);
      });

      router.push('/panel/editCategorie')
    } catch (error) {
      console.error("خطا در افزودن دسته:", error);
      Swal.fire("خطا", "مشکلی پیش آمده. دوباره تلاش کنید.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-1 px-4 py-10">
      <div className="w-full max-w-lg bg-white shadow-3 rounded-2xl p-8 mb-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-4 font-bold text-dark">افزودن دسته‌بندی</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1 text-sm rounded-lg bg-dark text-white shadow hover:bg-dark-2 transition"
          >
            دیدن دسته‌بندی‌ها
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* نام دسته‌بندی */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              نام دسته‌بندی *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-3 px-4 py-2.5 text-dark focus:ring-2 focus:ring-blue focus:outline-none"
              placeholder="مثلا: Desktop"
            />
          </div>

          {/* تعداد محصولات */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              تعداد محصولات
            </label>
            <input
              type="number"
              name="products"
              onChange={handleChange}
              value={formData.products}
              disabled
              className="w-full rounded-lg border border-gray-3 bg-gray-2 px-4 py-2.5 text-dark cursor-not-allowed"
            />
          </div>

          {/* انتخاب عکس */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-dark mb-2">
                تصویر دسته‌بندی *
              </label>
              <label className="flex items-center gap-2 text-sm text-dark">
                <input
                  type="checkbox"
                  checked={noImage}
                  onChange={handleNoImage}
                  className="w-4 h-4"
                />
                بدون عکس
              </label>
            </div>

            {!noImage && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-dark"
              />
            )}

            {preview && (
              <div className="mt-3">
                <img
                  src={preview || null}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-3"
                />
              </div>
            )}
          </div>

          {/* دکمه افزودن */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue text-white font-semibold shadow-2 hover:bg-blue-dark transition duration-200 disabled:opacity-50"
          >
            {loading ? "در حال ذخیره..." : "افزودن دسته‌بندی"}
          </button>
        </form>
      </div>

      {/* مودال نمایش دسته‌بندی‌ها */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-3 w-full max-w-2xl p-6 relative">
            {/* دکمه بستن */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 left-3 text-gray-500 hover:text-dark text-xl"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-dark mb-4 text-center">
              لیست دسته‌بندی‌های موجود
            </h3>

            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center justify-between border border-gray-3 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.img || "/images/notImg.png" || null}
                        alt={cat.name}
                        className="w-12 h-12 rounded-md object-cover border"
                      />
                      <span className="font-medium text-dark">{cat.name}</span>
                    </div>
                    <span className="text-sm text-gray-6">
                      محصولات: {cat.products}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-6 text-center">
                  هنوز دسته‌بندی‌ای ثبت نشده
                </p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
