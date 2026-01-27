"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// ✅ کامپوننت‌ها
import Breadcrumb from "@/components/Common/Breadcrumb";
import CustomSelect from "@/components/Header/CustomSelect";
import CategoryDropdown from "@/components/ShopWithSidebar/CategoryDropdown";
import GenderDropdown from "@/components/ShopWithSidebar/GenderDropdown";
import SizeDropdown from "@/components/ShopWithSidebar/SizeDropdown";
import ColorsDropdwon from "@/components/ShopWithSidebar/ColorsDropdwon";
import PriceDropdown from "@/components/ShopWithSidebar/PriceDropdown";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import SingleListItem from "@/components/Shop/SingleListItem";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;
const OPTIONS_URL = process.env.NEXT_PUBLIC_API_OPTIONS_URL;
const GENDERS_URL = process.env.NEXT_PUBLIC_API_GENDERS_URL;

const ShopWithSidebar = () => {
  // -----------------------------
  // 🧠 state ها
  // -----------------------------
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [productsData, setProductsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [options, setOptions] = useState([]);

  const [visibleProducts, setVisibleProducts] = useState([]);

  // -----------------------------
  // 📌 دریافت پارامتر داینامیک از URL
  // -----------------------------
  const params = useParams();

  const decodedCategorieId = useMemo(() => {
    if (!params?.categorieId) return "";
    return decodeURIComponent(
      Array.isArray(params.categorieId)
        ? params.categorieId[0]
        : params.categorieId
    );
  }, [params]);

  // -----------------------------
  // 📦 دریافت اطلاعات از سرور
  // -----------------------------
  const fetchProducts = useCallback(async () => {
    try {
      const urls = [
        `${BASE_URL}${PRODUCTS_URL}`,
        `${BASE_URL}${CATEGORYS_URL}`,
        `${BASE_URL}${GENDERS_URL}`,
        `${BASE_URL}${OPTIONS_URL}`,
      ];

      const [resProducts, resCategories, resGenders, resOptions] =
        await Promise.all(urls.map((url) => fetch(url)));

      if (![resProducts, resCategories, resGenders, resOptions].every((r) => r.ok)) {
        throw new Error("❌ خطا در دریافت داده‌ها از سرور");
      }

      const [products, categoriesData, gendersData, optionsData] =
        await Promise.all([
          resProducts.json(),
          resCategories.json(),
          resGenders.json(),
          resOptions.json(),
        ]);

      setProductsData(products.data);
      setCategories(categoriesData.data);
      setGenders(gendersData.data);
      setOptions(optionsData.data);
    } catch (err) {
      console.error("❌ خطا:", err);
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
  // 🔗 سینک کردن URL با فیلتر دسته‌بندی
  // -----------------------------
  useEffect(() => {
    if (!decodedCategorieId || categories.length === 0) return;

    const matchedCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === decodedCategorieId.toLowerCase()
    );

    if (matchedCategory) {
      setSelectedCategories([matchedCategory]);
    }
  }, [decodedCategorieId, categories]);

  // -----------------------------
  // 🔍 فیلتر + مرتب‌سازی محصولات (معماری تمیز)
  // -----------------------------
  const finalProducts = useMemo(() => {
    let list = [...productsData];

    // فیلتر دسته‌بندی
    if (selectedCategories.length) {
      list = list.filter((product) =>
        selectedCategories.some(
          (cat) => cat.name === product.categorie
        )
      );
    }

    // مرتب سازی
    if (selectedOption) {
      list = sortProducts(list, selectedOption.value);
    }

    return list;
  }, [productsData, selectedCategories, selectedOption]);

  // -----------------------------
  // 📄 کنترل pagination اولیه
  // -----------------------------
  useEffect(() => {
    setVisibleProducts(finalProducts.slice(0, 10));
  }, [finalProducts]);

  // -----------------------------
  // 📜 چسبندگی منو هنگام اسکرول
  // -----------------------------
  useEffect(() => {
    const handleScroll = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -----------------------------
  // 📦 بستن سایدبار با کلیک بیرون
  // -----------------------------
  useEffect(() => {
    if (!productSidebar) return;
    const handleClickOutside = (event) => {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productSidebar]);

  // -----------------------------
  // 🔽 مرتب سازی محصولات
  // -----------------------------
  const sortProducts = (products, optionValue) => {
    const sorted = [...products];

    switch (optionValue) {
      case "0":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;

      case "1":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;

      case "2":
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;

      case "3":
        sorted.sort((a, b) => a.count - b.count);
        break;

      default:
        break;
    }

    return sorted;
  };

  // -----------------------------
  // 🧱 خروجی JSX
  // -----------------------------
  return (
    <>
      <Breadcrumb
        title={`نمایش دسته بندی ${decodedCategorieId || "همه"}`}
        pages={["دسته بندی‌ها", "/", "محصولات با نوار کناری"]}
      />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 w-full">
          <div className="flex gap-7.5">

            {/* 🧭 سایدبار */}
            <aside className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 
              ${productSidebar ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto" : "-translate-x-full"}`}>

              <CategoryDropdown
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
              />

              <GenderDropdown genders={genders} />
              <SizeDropdown />
              <ColorsDropdwon />
              <PriceDropdown />
            </aside>

            {/* 🧩 لیست محصولات */}
            <main className="xl:max-w-[870px] w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9">
                {visibleProducts.map((item) => (
                  <SingleGridItem key={item._id} item={item} />
                ))}
              </div>
            </main>

          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
