"use client";

import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function EditProductId({ params }) {
  const resolvedParams = use(params); 
  const _id = resolvedParams._id; // استفاده از _id (طبق دستورات قبلی شما)
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;
  const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCategory, setOriginalCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    reviews: 0,
    price: 0,
    discountedPrice: 0,
    hasDiscount: false,
    categorie: "",
    imgs: { thumbnails: [], previews: [] }, 
    files: { thumbnails: [null, null], previews: [null, null] }, 
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!_id) return;
      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(`${BASE_URL}${PRODUCTS_URL}/${_id}`),
          fetch(`${BASE_URL}${CATEGORYS_URL}`)
        ]);

        if (!productRes.ok) throw new Error("خطا در دریافت محصول");

        const productJson = await productRes.json();
        const categoryJson = await categoryRes.json();
        const actualData = productJson.data || productJson;

        setFormData(prev => ({
          ...prev,
          ...actualData,
          imgs: {
            thumbnails: actualData.imgs?.thumbnails || [null, null],
            previews: actualData.imgs?.previews || [null, null],
          },
          files: { thumbnails: [null, null], previews: [null, null] },
        }));

        setOriginalCategory(actualData.categorie);
        setCategories(categoryJson.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        Swal.fire("خطا", "اطلاعات محصول یافت نشد", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  // --- اضافه کردن بخش Cleanup برای مدیریت حافظه تصاویر ---
  useEffect(() => {
    return () => {
      // این بخش موقع خروج از صفحه، آدرس‌های موقت عکس‌ها را از رم پاک می‌کند
      [...formData.files.thumbnails, ...formData.files.previews].forEach(file => {
        if (file) URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [formData.files]);

  // تابع کمکی برای آپدیت تعداد محصولات
  const updateCategoryCount = async (categoryName, increment) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return;

    return fetch(`${BASE_URL}${CATEGORYS_URL}/${category._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        products: (category.products || 0) + increment,
        id: category.id // حفظ فیلد id در بدنه طبق دستور شما
      }),
    });
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => {
      const newFiles = { ...prev.files };
      newFiles[type][index] = file;
      return { ...prev, files: newFiles };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("reviews", formData.reviews);
      data.append("price", formData.price);
      data.append("hasDiscount", formData.hasDiscount);
      data.append("discountedPrice", formData.hasDiscount ? formData.discountedPrice : 0);
      data.append("categorie", formData.categorie);

      formData.files.thumbnails.forEach((file, i) => {
        if (file) data.append(`thumb_${i}`, file);
      });
      formData.files.previews.forEach((file, i) => {
        if (file) data.append(`prev_${i}`, file);
      });

      const res = await fetch(`${BASE_URL}${PRODUCTS_URL}/${_id}`, {
        method: "PATCH",
        body: data,
      });

      if (res.ok) {
        // --- بهینه‌سازی (Optimistic UI): آپدیت همزمان هر دو دسته‌بندی ---
        if (formData.categorie !== originalCategory) {
          await Promise.all([
            updateCategoryCount(originalCategory, -1),
            updateCategoryCount(formData.categorie, 1)
          ]);
        }

        Swal.fire({ icon: "success", title: "تغییرات با موفقیت ذخیره شد", timer: 1500, showConfirmButton: false });
        router.push("/panel/editProduct");
      } else {
        throw new Error("خطا در آپدیت");
      }
    } catch (err) {
      Swal.fire("خطا", "عملیات ناموفق بود", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">در حال بارگذاری...</div>;

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 mb-20">
      <h2 className="text-center text-2xl font-bold text-gray-700 border-b pb-4">ویرایش محصول</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600">عنوان محصول</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full mt-1 border rounded-xl px-4 py-2 outline-none focus:border-blue" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600">دسته‌بندی</label>
          <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full mt-1 border rounded-xl px-4 py-2 outline-none">
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600">قیمت اصلی</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 border rounded-xl px-4 py-2 outline-none" />
        </div>
        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={handleChange} />
            <span className="text-sm font-semibold text-gray-600">دارای تخفیف؟</span>
          </label>
        </div>
        {formData.hasDiscount && (
          <div>
            <label className="block text-sm font-semibold text-gray-600">قیمت با تخفیف</label>
            <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} className="w-full mt-1 border rounded-xl px-4 py-2 border-green-500 outline-none" />
          </div>
        )}
      </div>

      {/* بخش تصاویر اصلی */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">تصاویر اصلی (Previews)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.imgs.previews.map((imgUrl, i) => (
            <div key={i} className="relative group border-2 border-dashed rounded-xl p-2 flex flex-col items-center bg-gray-50">
              <img 
                src={formData.files.previews[i] ? URL.createObjectURL(formData.files.previews[i]) : `${BASE_URL}${imgUrl}`} 
                className="w-full h-32 object-contain rounded-lg mb-2" 
                alt="preview"
              />
              <input type="file" onChange={(e) => handleImageChange(e, "previews", i)} className="text-[10px] w-full cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      {/* بخش تصاویر کوچک */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">تصاویر کوچک (Thumbnails)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.imgs.thumbnails.map((imgUrl, i) => (
            <div key={i} className="relative group border-2 border-dashed rounded-xl p-2 flex flex-col items-center bg-gray-50">
              <img 
                src={formData.files.thumbnails[i] ? URL.createObjectURL(formData.files.thumbnails[i]) : `${BASE_URL}${imgUrl}`} 
                className="w-full h-24 object-contain rounded-lg mb-2" 
                alt="thumbnail"
              />
              <input type="file" onChange={(e) => handleImageChange(e, "thumbnails", i)} className="text-[10px] w-full cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

     <button 
  type="submit" 
  disabled={isSubmitting} 
  className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 
    ${isSubmitting 
      ? "bg-gray-600 cursor-not-allowed text-[#232936] opacity-90" // استایل زمان سابمیت: خاکستری تیره برای وضوح در بک‌گراند سفید
      : "bg-[#232936] hover:bg-black text-white active:scale-95" // استایل حالت عادی
    }`}
>
  {isSubmitting ? (
    <>
      {/* لودر چرخشی با ضخامت بیشتر برای دید بهتر */}
      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>در حال ثبت تغییرات...</span>
    </>
  ) : (
    "بروزرسانی نهایی محصول"
  )}
</button>
    </form>
  );
}