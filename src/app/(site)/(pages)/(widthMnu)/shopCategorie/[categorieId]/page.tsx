"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

// Components
import Breadcrumb from "@/components/Common/Breadcrumb";
import CustomSelect from "@/components/Header/CustomSelect";
import CategoryDropdown from "@/components/ShopWithSidebar/CategoryDropdown";
import GenderDropdown from "@/components/ShopWithSidebar/GenderDropdown";
import SizeDropdown from "@/components/ShopWithSidebar/SizeDropdown";
import ColorsDropdwon from "@/components/ShopWithSidebar/ColorsDropdwon";
import PriceDropdown from "@/components/ShopWithSidebar/PriceDropdown";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import SingleListItem from "@/components/Shop/SingleListItem";

type Product = {
  id: string | number;
  name: string;
  categorie: string;
  [key: string]: any;
};

type Category = { id: string | number; name: string };
type Gender = { id: string | number; name: string };
type Option = { id: string | number; label: string };

const ShopWithSidebar = () => {
  // -----------------------------
  // State
  // -----------------------------
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const [productsData, setProductsData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // -----------------------------
  // Dynamic Route Param
  // -----------------------------
  const params = useParams<{ categorieId?: string | string[] }>();

  const decodedCategorieId = (() => {
    if (!params?.categorieId) return "";
    return decodeURIComponent(
      Array.isArray(params.categorieId)
        ? params.categorieId[0]
        : params.categorieId
    );
  })();

  // -----------------------------
  // Sticky menu scroll listener
  // -----------------------------
  useEffect(() => {
    const handleScroll = () => setStickyMenu(window.scrollY >= 80);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -----------------------------
  // Close Sidebar on Outside Click
  // -----------------------------
  useEffect(() => {
    if (!productSidebar) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productSidebar]);

  // -----------------------------
  // Fetch Data From Server
  // -----------------------------
  const fetchProducts = useCallback(async () => {
    try {
      const urls = [
        "http://localhost:3000/products",
        "http://localhost:3000/categories",
        "http://localhost:3000/genders",
        "http://localhost:3000/options",
      ];

      const [resProducts, resCategories, resGenders, resOptions] =
        await Promise.all(urls.map((url) => fetch(url)));

      if (![resProducts, resCategories, resGenders, resOptions].every((r) => r.ok)) {
        throw new Error("خطا در دریافت داده‌ها");
      }

      const [products, categoriesData, gendersData, optionsData] =
        await Promise.all([
          resProducts.json(),
          resCategories.json(),
          resGenders.json(),
          resOptions.json(),
        ]);

      setProductsData(products);
      setCategories(categoriesData);
      setGenders(gendersData);
      setOptions(optionsData);
    } catch (err) {
      console.error(err);
      setProductsData([]);
      setCategories([]);
      setGenders([]);
      setOptions([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // -----------------------------
  // Filter Products by Category
  // -----------------------------
  useEffect(() => {
    if (!decodedCategorieId) {
      setFilteredProducts(productsData);
      return;
    }
    setFilteredProducts(
      productsData.filter((item) => item.categorie === decodedCategorieId)
    );
  }, [productsData, decodedCategorieId]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <Breadcrumb
        title={`نمایش دسته بندی ${decodedCategorieId || "همه"}`}
        pages={["دسته بندی ها", "/", "دسته بندی محصول با نوار کناری"]}
      />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 w-full">
          <div className="flex gap-7.5">
            {/* Sidebar */}
            <aside
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 
                ${
                  productSidebar
                    ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                    : "-translate-x-full"
                }`}
            >
              {/* Mobile Toggle Button */}
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="toggle sidebar"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg width="24" height="24" fill="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Filters */}
              {filteredProducts.length > 0 && (
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="flex flex-col gap-6">
                    <div className="bg-white shadow-1 rounded-lg py-4 px-5 flex justify-between items-center">
                      <p>فیلترها:</p>
                      <button
                        type="button"
                        className="text-blue"
                        onClick={() => console.log("Clear filters!")}
                      >
                        پاک کردن همه
                      </button>
                    </div>

                    <CategoryDropdown categories={categories} />
                    <GenderDropdown genders={genders} />
                    <SizeDropdown />
                    <ColorsDropdwon />
                    <PriceDropdown />
                  </div>
                </form>
              )}
            </aside>

            {/* Main Content */}
            <main className="xl:max-w-[870px] w-full">
              {/* Top Bar */}
              {filteredProducts.length > 0 && (
                <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6 flex items-center justify-between">
                  <CustomSelect options={options} />
                  <p>
                    نمایش{" "}
                    <span className="text-dark">
                      {filteredProducts.length}
                    </span>{" "}
                    محصول
                  </p>

                  <div className="flex gap-2.5">
  {/* Grid Button */}
  <button
    onClick={() => setProductStyle("grid")}
    className={`${
      productStyle === "grid"
        ? "bg-blue border-blue text-white"
        : "text-dark bg-gray-1 border-gray-3"
    } flex items-center justify-center w-10.5 h-9 rounded-[5px] border`}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </button>

  {/* List Button */}
  <button
    onClick={() => setProductStyle("list")}
    className={`${
      productStyle === "list"
        ? "bg-blue border-blue text-white"
        : "text-dark bg-gray-1 border-gray-3"
    } flex items-center justify-center w-10.5 h-9 rounded-[5px] border`}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="1" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </button>
</div>
                </div>
              )}

              {/* Products */}
              <div
                className={`${
                  productStyle === "grid" && filteredProducts.length > 0
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }`}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={item.id} />
                    ) : (
                      <SingleListItem item={item} key={item.id} />
                    )
                  )
                ) : (
                  <p className="text-center text-2xl font-bold">
                    محصولی با این دسته بندی "{decodedCategorieId}" یافت نشد
                  </p>
                )}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="flex justify-center mt-15">
                  <p>Pagination here...</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;