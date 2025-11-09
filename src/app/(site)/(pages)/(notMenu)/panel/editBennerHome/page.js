"use client";
// components/BannerSliderEditor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";

const BannerSliderEditor = () => {
  const [bannerItems, setBannerItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search & Category filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Combobox dropdown state
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Helpers
  const formatPrice = (num) => {
    if (num === undefined || num === null) return "-";
    try {
      return new Intl.NumberFormat("fa-IR").format(Number(num));
    } catch {
      return num;
    }
  };

  const getImageUrl = (item) =>
    item?.imgs?.previews?.[0] ||
    item?.preview ||
    item?.thumbnail ||
    item?.image ||
    "/placeholder.jpg";

  const handleImageError = (e) => {
    if (e?.target?.src?.includes("placeholder.jpg")) return;
    e.target.src = "/placeholder.jpg";
  };

  // ❌ Removed RegExp-based highlighting logic

  // Fetch data
  const fetchBannerData = async () => {
    try {
      const res = await fetch("http://localhost:3001/bennerHomeData");
      const data = await res.json();
      setBannerItems(data || []);
    } catch (error) {
      console.error("Error fetching banner data:", error);
      Swal.fire("خطا", "دریافت داده‌های بنر با خطا مواجه شد", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire("خطا", "دریافت محصولات با خطا مواجه شد", "error");
    }
  };

  useEffect(() => {
    fetchBannerData();
    fetchProducts();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoized data processing
  const { categories, catCounts } = useMemo(() => {
    const counts = {};
    for (const p of products) {
      const c = p?.categorie || "بدون دسته";
      counts[c] = (counts[c] || 0) + 1;
    }
    const cats = Object.keys(counts).sort((a, b) => a.localeCompare(b, "fa"));
    return { categories: ["all", ...cats], catCounts: counts };
  }, [products]);

  const bannerIdSet = useMemo(() => new Set(bannerItems.map((b) => String(b.id))), [bannerItems]);

  const filteredProducts = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase().trim();
    return products
      .filter((p) => selectedCategory === "all" || p?.categorie === selectedCategory)
      .filter((p) => !searchTerm || String(p.title || "").toLowerCase().includes(searchTerm))
      .slice(0, 30);
  }, [products, selectedCategory, debouncedSearch]);

  // Actions (Delete & Add)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "حذف آیتم",
      text: "این آیتم از بنر حذف خواهد شد. مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    });
    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await fetch(`http://localhost:3001/bennerHomeData/${id}`, { method: "DELETE" });
      setBannerItems((prev) => prev.filter((item) => item.id !== id));
      Swal.fire("حذف شد!", "آیتم مورد نظر از بنر حذف شد.", "success");
    } catch (error) {
      console.error("Error deleting banner item:", error);
      Swal.fire("خطا", "حذف آیتم با خطا مواجه شد", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const addProductToBanner = async (product) => {
    if (bannerIdSet.has(String(product.id))) {
      Swal.fire("تکراری", "این محصول از قبل در بنر وجود دارد.", "info");
      return;
    }
    try {
      setAddingId(product.id);
      const res = await fetch("http://localhost:3001/bennerHomeData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      setBannerItems((prev) => [...prev, data]);
      Swal.fire("موفق!", "محصول به بنر اضافه شد.", "success");
    } catch (error) {
      console.error("Error adding banner item:", error);
      Swal.fire("خطا", "افزودن محصول به بنر با خطا مواجه شد", "error");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    // Skeleton Component
    return <div className="p-6 text-center">در حال بارگذاری...</div>;
  }

  return (
    <div dir="rtl" className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">ویرایش بنر اصلی</h1>

        {/* Add Product Panel */}
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 mb-6">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${
                    active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat === "all" ? "همه" : cat}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                    {formatPrice(cat === "all" ? products.length : catCounts[cat] || 0)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input and Results */}
          <div className="mt-4" ref={searchContainerRef}>
            <label htmlFor="search" className="block text-gray-700 text-sm font-medium mb-1">
              جستجوی محصول برای افزودن
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="نام محصول را بنویسید..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-3"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="پاک کردن"
                >
                  ✕
                </button>
              )}

              {/* Results Dropdown */}
              {showResults && (
                <div className="absolute z-50 mt-2 w-full max-h-80 overflow-auto rounded-lg border bg-white shadow-lg">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">موردی یافت نشد.</div>
                  ) : (
                    <ul className="divide-y">
                      {filteredProducts.map((p) => {
                        const alreadyAdded = bannerIdSet.has(String(p.id));
                        const addingThis = addingId === p.id;
                        return (
                          <li key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                            <img
                              src={getImageUrl(p) || null}
                              alt={p.title}
                              onError={handleImageError}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="min-w-0 flex-1">
                              {/* ✅ Simple title rendering without highlighting */}
                              <div className="font-medium text-gray-800 truncate">{p.title || "بدون عنوان"}</div>
                              <div className="text-xs text-gray-500">
                                {formatPrice(p.hasDiscount ? p.discountedPrice : p.price)} تومان
                              </div>
                            </div>
                            {alreadyAdded ? (
                              <span className="text-xs font-medium text-green-600">افزوده شد</span>
                            ) : (
                              <button
                                onClick={() => addProductToBanner(p)}
                                disabled={addingThis}
                                className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition ${
                                  addingThis ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                              >
                                {addingThis ? "..." : "➕ افزودن"}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Banner Items Grid */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">آیتم‌های بنر ({formatPrice(bannerItems.length)})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bannerItems.length === 0 ? (
            <div className="col-span-full p-6 bg-white rounded-xl border text-gray-600">
              <span>هنوز آیتمی در بنر اضافه نشده است.</span>
            </div>
          ) : (
            bannerItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className={`absolute top-3 left-3 z-10 p-2 rounded-full border transition ${
                    deletingId === item.id
                      ? "bg-red-300 text-white cursor-not-allowed"
                      : "bg-white/80 backdrop-blur text-red-600 hover:bg-red-600 hover:text-white"
                  }`}
                  aria-label="حذف"
                >
                  {deletingId === item.id ? "..." : "🗑️"}
                </button>
                <div className="relative w-full pt-[56.25%] bg-gray-100">
                  <img
                    src={getImageUrl(item) || null}
                    alt={item.title || "محصول"}
                    loading="lazy"
                    onError={handleImageError}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {item.hasDiscount && (
                    <span className="absolute top-3 right-3 rounded-full bg-red-600/90 text-white text-xs font-bold px-3 py-1">
                      تخفیف
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{item.title || "بدون عنوان"}</h3>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-red-600">
                        {formatPrice(item.hasDiscount ? item.discountedPrice : item.price)}
                      </span>
                      <span className="text-sm text-gray-600">تومان</span>
                    </div>
                    {item.hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerSliderEditor;