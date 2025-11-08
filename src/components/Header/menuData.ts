import { Menu } from "@/types/Menu";

// داده‌های منو برای ناوبار (فارسی)
export const menuData: Menu[] = [
  {
    id: 1,
    title: "محبوب", // Popular
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "فروشگاه", // Shop
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "تماس با ما", // Contact
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    title: "صفحات", // Pages
    newTab: false,
    path: "/",
    submenu: [
      { id: 61, title: "فروشگاه با نوارکناری", newTab: false, path: "/shop-with-sidebar" },
      { id: 62, title: "فروشگاه بدون نوارکناری", newTab: false, path: "/shop-without-sidebar" },
      { id: 64, title: "تسویه حساب", newTab: false, path: "/checkout" },
      { id: 65, title: "سبد خرید", newTab: false, path: "/cart" },
      { id: 66, title: "لیست علاقه‌مندی‌ها", newTab: false, path: "/wishlist" },
      { id: 67, title: "ورود", newTab: false, path: "/signin" },
      { id: 68, title: "ثبت نام", newTab: false, path: "/signup" },
      { id: 69, title: "حساب من", newTab: false, path: "/my-account" },
      { id: 70, title: "تماس با ما", newTab: false, path: "/contact" },
      { id: 62, title: "خطا", newTab: false, path: "/error" },
      { id: 63, title: "ارسال موفق", newTab: false, path: "/mail-success" },
    ],
  },
  {
    id: 7,
    title: "وبلاگ‌ها", // Blogs
    newTab: false,
    path: "/",
    submenu: [
      { id: 71, title: "وبلاگ شبکه‌ای با نوارکناری", newTab: false, path: "/blogs/blog-grid-with-sidebar" },
      { id: 72, title: "وبلاگ شبکه‌ای", newTab: false, path: "/blogs/blog-grid" },
      { id: 73, title: "جزئیات وبلاگ با نوارکناری", newTab: false, path: "/blogs/blog-details-with-sidebar" },
      { id: 74, title: "جزئیات وبلاگ", newTab: false, path: "/blogs/blog-details" },
    ],
  },
];
