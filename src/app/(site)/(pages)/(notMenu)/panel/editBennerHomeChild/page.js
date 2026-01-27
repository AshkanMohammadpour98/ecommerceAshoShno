"use client";
// components/ChildBannerSliderEditor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";

// --- آیکن‌های SVG برای استفاده در کامپوننت ---
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const IconSpinner = () => <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>;

// URLs
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const CHAILD_BENNER_HOME_URL = process.env.NEXT_PUBLIC_API_CHAILD_BENNER_HOME_URL;
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;

const ChildBannerSliderEditor = () => {
  const [bannerItems, setBannerItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const BANNER_LIMIT = 2;

  // --- Helpers ---
  const formatPrice = (num) => new Intl.NumberFormat("fa-IR").format(num);
  const getImageUrl = (item) => item?.imgs?.previews?.[0] || item?.image || "/images/notImg.png";
  const handleImageError = (e) => { e.target.src = "/images/notImg.png"; };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, productsRes] = await Promise.all([
          // ✅ API Endpoint changed here
          fetch(`${BASE_URL}${CHAILD_BENNER_HOME_URL}`),
          fetch(`${BASE_URL}${PRODUCTS_URL}`)
        ]);
        const bannerData = await bannerRes.json();
        const productsData = await productsRes.json();
        setBannerItems(bannerData.data || []);
        setProducts(productsData.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Swal.fire("خطا", "دریافت اطلاعات با مشکل مواجه شد", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Hooks and Memos ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Core logic for the limit
  const isBannerFull = useMemo(() => bannerItems.length >= BANNER_LIMIT, [bannerItems]);

  const { categories, catCounts } = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      const cat = p?.categorie || "بدون دسته";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return { categories: ["all", ...Object.keys(counts).sort()], catCounts: counts };
  }, [products]);

  const bannerIdSet = useMemo(() => new Set(bannerItems.map(b => String(b._id))), [bannerItems]);

  const filteredProducts = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase().trim();
    return products
      .filter(p => selectedCategory === "all" || p?.categorie === selectedCategory)
      .filter(p => !searchTerm || String(p.title || "").toLowerCase().includes(searchTerm))
      .slice(0, 30);
  }, [products, selectedCategory, debouncedSearch]);


  // --- Actions ---
  const handleDelete = async (_id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این آیتم از بنر حذف خواهد شد.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#6b7280",
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        confirmBtn.style.backgroundColor = '#3085d6';
        confirmBtn.style.color = '#fff';
        cancelBtn.style.backgroundColor = '#d33';
        cancelBtn.style.color = '#fff';

        const hoverStyle = document.createElement('style');
        hoverStyle.innerHTML = `
                                  .swal2-confirm:hover { background-color: #256ab3 !important; }
                                  .swal2-cancel:hover { background-color: #a00 !important; }
                                `;
        document.head.appendChild(hoverStyle);
      }
    });
    if (!result.isConfirmed) return;

    // console.log(_id, 'item _id props');

    setDeletingId(_id);
    try {
      await fetch(`${BASE_URL}${CHAILD_BENNER_HOME_URL}/${_id}`, { method: "DELETE" });
      setBannerItems(prev => prev.filter(item => item._id !== _id));
    } catch (error) {
      Swal.fire("خطا", "حذف آیتم با مشکل مواجه شد.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const addProductToBanner = async (product) => {
    if (isBannerFull || bannerIdSet.has(String(product._id))) return;

    setAddingId(product._id);
    try {
      const res = await fetch(`${BASE_URL}${CHAILD_BENNER_HOME_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      setBannerItems(prev => [...prev, data.data]);
    } catch (error) {
      Swal.fire("خطا", "افزودن محصول با مشکل مواجه شد.", "error");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <div className="p-6 text-center">در حال بارگذاری...</div>;

  return (
    <div dir="rtl" className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">ویرایش بنر دوتایی</h1>

        {/* --- Add Product Panel with Lock State --- */}
        <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-8">
          {/* ✅ Locked Overlay */}
          {isBannerFull && (
            <div className="absolute inset-0 z-20 bg-gray-100/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
              <div className="bg-white p-6 rounded-lg shadow-md text-center border">
                <IconLock />
                <h3 className="mt-2 text-lg font-bold text-gray-800">ظرفیت بنر تکمیل است</h3>
                <p className="mt-1 text-sm text-gray-600">برای افزودن محصول جدید، ابتدا یکی از موارد زیر را حذف کنید.</p>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-700 mb-3">افزودن محصول به بنر</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-3 -mb-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <span>{cat === "all" ? "همه دسته‌ها" : cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === cat ? "bg-white/20" : "bg-gray-200"}`}>
                  {formatPrice(cat === "all" ? products.length : catCounts[cat] || 0)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4" ref={searchContainerRef}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="جستجوی محصول..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            {showResults && (
              <div className="absolute z-10 mt-2 w-full max-w-lg rounded-lg border bg-white shadow-xl max-h-80 overflow-auto">
                {filteredProducts.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {filteredProducts.map(p => (
                      <li key={p._id} className="flex items-center gap-3 p-3 text-sm hover:bg-gray-50 transition-colors">
                        <img src={getImageUrl(p) || null} alt="img" className="w-12 h-12 rounded-md object-cover flex-shrink-0" onError={handleImageError} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{p.title}</p>
                          <p className="text-gray-500">{formatPrice(p.price)} تومان</p>
                        </div>
                        {bannerIdSet.has(String(p._id)) ? (
                          <span className="text-green-600 font-medium px-3 text-xs">✓ افزوده شد</span>
                        ) : (
                          <button
                            onClick={() => addProductToBanner(p)}
                            disabled={addingId === p._id}
                            className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-blue-600 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                          >
                            {addingId === p._id ? <IconSpinner /> : <IconPlus />}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">موردی یافت نشد.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- Banner Slots Grid --- */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">جایگاه‌های بنر ({bannerItems.length} از {BANNER_LIMIT})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Render existing items */}
          {bannerItems.map(item => (
            <div key={item._id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative w-full pt-[56.25%] bg-gray-100">
                <img src={getImageUrl(item) || null} alt={item.title || null} className="absolute inset-0 w-full h-full object-cover" onError={handleImageError} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                {item.hasDiscount && <span className="absolute top-3 right-3 text-xs font-bold text-white bg-red-600 px-2.5 py-1 rounded-full">تخفیف</span>}
                <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id} className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:text-red disabled:opacity-100 disabled:bg-red">
                  {deletingId === item._id ? <IconSpinner /> : <IconTrash />}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate" title={item.title}>{item.title}</h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-xl font-bold text-blue-600">{formatPrice(item.hasDiscount ? item.discountedPrice : item.price)}<span className="text-sm font-normal text-gray-500 mr-1"> تومان</span></p>
                  {item.hasDiscount && <p className="text-sm text-gray-400 line-through">{formatPrice(item.price)}</p>}
                </div>
              </div>
            </div>
          ))}

          {/* ✅ Render Placeholder for empty slots */}
          {Array.from({ length: BANNER_LIMIT - bannerItems.length }).map((_, index) => (
            <button
              key={`placeholder-${index}`}
              onClick={() => searchInputRef.current?.focus()}
              className="flex flex-col items-center justify-center text-center bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-gray-500 hover:text-blue-600 min-h-[250px]"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                <IconPlus />
              </div>
              <h3 className="font-semibold">افزودن محصول</h3>
              <p className="text-sm">یک جایگاه خالی است</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChildBannerSliderEditor;