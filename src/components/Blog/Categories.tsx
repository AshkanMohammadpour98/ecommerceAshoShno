"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// 📌 نکته: selectedCats را از ورودی حذف کردیم چون پایین‌تر با Hook دریافتش می‌کنیم
const Categories = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ✅ بهترین راه در Client Component: خواندن مستقیم از URL
  // این کار باعث می‌شود اگر کاربر دکمه Back مرورگر را زد، چک‌باکس‌ها فوراً آپدیت شوند
  const selectedCats = searchParams.getAll("cat");

  const handleCategoryChange = (categoryName) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSelected = params.getAll("cat");

    if (currentSelected.includes(categoryName)) {
      const filtered = currentSelected.filter((c) => c !== categoryName);
      params.delete("cat"); 
      filtered.forEach((c) => params.append("cat", c)); 
    } else {
      params.append("cat", categoryName);
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };
  return (
    <div className={`shadow-1 bg-white rounded-xl mt-7.5 ${isPending ? "opacity-70" : ""}`}>
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3 text-right">
        <h2 className="font-medium text-lg text-dark">دسته بندی ها</h2>
      </div>
      
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {categories.map((item) => {
          const isChecked = selectedCats.includes(item.name);
          
          return (
            <label
              key={item.name}
              className="group flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* بخش چک‌باکس سفارشی */}
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(item.name)}
                  />
                  {/* استایل باکس بیرونی چک‌باکس */}
                  <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all duration-200 ${
                    isChecked ? "bg-blue border-blue" : "border-gray-3 bg-white"
                  }`}>
                    {/* آیکون تیک (فقط در صورت انتخاب نمایش داده می‌شود) */}
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* متن دسته‌بندی با تغییر رنگ در حالت انتخاب یا هاور */}
                <span className={`transition-colors duration-200 ${
                  isChecked ? "text-blue font-bold" : "text-dark"
                } group-hover:text-blue`}>
                  {item.name}
                </span>
              </div>
              
              {/* دایره نمایش تعداد محصولات هر دسته */}
              <span className={`inline-flex rounded-[30px] px-2 py-0.5 text-custom-xs transition-colors duration-200 ${
                isChecked ? "bg-blue text-white" : "bg-gray-2 text-dark"
              }`}>
                {item.products}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;