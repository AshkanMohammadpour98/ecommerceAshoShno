/*
  این کامپوننت Breadcrumb یک نوار مسیریابی راست‌به‌چپ نمایش می‌دهد: عنوان صفحه و مسیر صفحات (خانه → ...).
  هدف: کمک به درک موقعیت فعلی کاربر در سایت و امکان بازگشت سریع به سطوح قبلی.
*/

import Link from "next/link";
import React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

// هر آیتم breadcrumb می‌تواند یک رشته (فقط برچسب) یا آبجکت با برچسب و لینک اختیاری باشد.
type Crumb = string | { label: string; href?: string };

// یکسان‌سازی ورودی‌ها: رشته‌ها را به آبجکت { label } تبدیل می‌کند تا در رندرینگ یک شکل عمل کنیم.
// مثال: "وبلاگ" -> { label: "وبلاگ" }
const normalizePages = (pages: Crumb[] = []) =>
  pages.map((p) => (typeof p === "string" ? { label: p } : p));

// کامپوننت اصلی: عنوان و مسیر صفحات را با نشانه‌گذاری معنایی (nav/ol/li) و دسترس‌پذیری مناسب رندر می‌کند.
const Breadcrumb = ({ title, pages = [] }: { title: string; pages: Crumb[] }) => {
  // آرایه نهایی آیتم‌ها که همگی حداقل دارای label هستند.
  const crumbs = normalizePages(pages);

  // نکته: dir="rtl" جهت‌دهی راست‌به‌چپ را تضمین می‌کند؛ فاصله‌دهی‌های Tailwind متناسب با نقاط شکست تنظیم شده‌اند.
  return (
    <div className="overflow-hidden shadow-breadcrumb" dir="rtl">
      {/* خط جداکننده‌ی بالا برای تفکیک بصری از بخش‌های پیشین */}
      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* عنوان صفحه */}
            {/* کلاس truncate از سرریز عنوان جلوگیری می‌کند؛ اندازه فونت با نقاط شکست تغییر می‌کند. */}
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2 truncate">
              {title}
            </h1>

            {/* مسیر صفحات */}
            <nav aria-label="breadcrumb">
              {/* استفاده از ol/li ساختار معنایی breadcrumb را برای فناوری‌های کمکی روشن می‌کند. */}
              <ol className="flex items-center gap-1.5 text-custom-sm">
                <li>
                  <Link className="text-dark hover:text-blue" href="/">
                    خانه
                  </Link>
                </li>
                {crumbs.map((c, idx) => {
                  // تعیین آیتم آخر برای تعیین aria-current و استایل متفاوت.
                  const isLast = idx === crumbs.length - 1;
                  return (
                    // کلید بر اساس label و اندیس؛ اگر امکان تکرار label هست بهتر است از شناسه یکتا/href هم کمک بگیرید.
                    <li key={`${c.label}-${idx}`} className="flex items-center gap-1.5">
                      {/* آیکن جداساز؛ تزئینی است و با aria-hidden از دسترس اسکرین‌ریدر خارج شده */}
                      <ChevronLeftIcon className="w-4 h-4 text-gray-5" aria-hidden />
                      {/* اگر لینک دارد و آخرین نیست، Link رندر می‌شود؛ در غیر این‌صورت span غیرفعال با aria-current="page" */}
                      {c.href && !isLast ? (
                        <Link className="text-dark hover:text-blue" href={c.href}>
                          {c.label}
                        </Link>
                      ) : (
                        <span
                          className={`capitalize ${isLast ? "text-blue" : "text-dark-4"}`}
                          // aria-current فقط برای آیتم فعلی ست می‌شود تا موقعیت کاربر مشخص گردد.
                          aria-current={isLast ? "page" : undefined}
                        >
                          {c.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;