"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("search") || "");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    
    // انتقال کاربر به URL جدید با حفظ پارامترهای قبلی (مثل دسته بندی)
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="shadow-1 bg-white rounded-xl">
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="اینجا جستجو کنید..."
              className="w-full rounded-md border border-gray-3 py-3 pl-5 pr-13 outline-none focus:ring-2 focus:ring-blue/20"
            />
            <button type="submit" className="absolute right-0 top-0 px-4 py-3.5 hover:text-blue">
              {/* SVG مشابه کد خودتان */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;