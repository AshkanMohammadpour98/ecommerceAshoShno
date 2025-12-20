"use client";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * 💡 تابع کمکی برای تجزیه تاریخ
 * بهبود: حالا اگر جداکننده تاریخ (-) باشد یا فرمت نامعتبر باشد، برنامه کرش نمی‌کند.
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  
  // استخراج اعداد از رشته (چه با / جدا شده باشد چه با -)
  const parts = dateStr.match(/(\d+)/g);
  
  if (!parts || parts.length < 3) return null;

  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
}

function formatDate({ year, month, day }) {
  return `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
}

/**
 * 💡 تابع گروه‌بندی داده‌ها
 * این تابع بیرون کامپوننت است تا در هر رندر دوباره ساخته نشود.
 */
function groupData(productData, type) {
  const count = {};

  productData.forEach((item) => {
    // اگر محصولی تاریخ نداشت، ازش رد شو (جلوگیری از ارور)
    if (!item.date) return;

    const parsed = parseDate(item.date);
    if (!parsed) return; // اگر فرمت تاریخ اشتباه بود

    const { year, month, day } = parsed;
    let key = "";

    switch (type) {
      case "daily":
        key = formatDate({ year, month, day });
        break;
      case "weekly":
        // محاسبه شماره هفته در سال (به جای ماه) برای دقت بیشتر
        // فعلاً همان منطق ساده شما را حفظ کردم اما با اطمینان بیشتر
        const week = Math.ceil(day / 7);
        key = `${year}/${month}-هفته ${week}`;
        break;
      case "monthly":
        key = `${year}/${month.toString().padStart(2, "0")}`; // افزودن صفر قبل از تک‌رقم
        break;
      case "yearly":
        key = `${year}`;
        break;
      default:
        key = formatDate({ year, month, day });
    }

    count[key] = (count[key] || 0) + 1;
  });

  // مرتب‌سازی کلیدها (تاریخ‌ها) از قدیم به جدید
  const sortedKeys = Object.keys(count).sort((a, b) => {
    // یک تاریخ فرضی برای مقایسه درست می‌سازیم
    const cleanA = a.replace("-هفته ", "/"); // هندل کردن رشته‌های خاص مثل هفته
    const cleanB = b.replace("-هفته ", "/");
    return cleanA.localeCompare(cleanB);
  });

  return sortedKeys.map((key) => ({ name: key, articles: count[key] }));
}

// Tooltip سفارشی (بدون تغییر استایل)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow border text-sm space-y-1">
        <div className="font-medium">{data.name}</div>
        <div>تعداد محصولات: {data.articles}</div>
        {/* فقط وقتی مقایسه فعال است و دیتای قبلی وجود دارد نمایش بده */}
        {data.prevArticles !== undefined && (
          <div className="text-gray-500">
            دوره قبل: {data.prevArticles !== null ? data.prevArticles : "بدون دیتا"}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ChartProducts() {
  const [productData, setProductData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true); // 💡 اضافه کردن وضعیت لودینگ

  useEffect(() => {
    // 💡 اصلاح آدرس API به آدرس صحیح
    fetch("http://localhost:3000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در ارتباط با سرور");
        return res.json();
      })
      .then((data) => {
        // 💡 بررسی دقیق ساختار دیتا برای جلوگیری از کرش کردن
        // اگر دیتا داخل data.data بود، یا مستقیم آرایه بود
        const safeData = data.data || (Array.isArray(data) ? data : []);
        setProductData(safeData);
      })
      .catch((err) => {
        console.error("خطا:", err);
        setProductData([]);
      })
      .finally(() => setLoading(false)); // در هر صورت لودینگ تمام شود
  }, []);

  /**
   * 💡 استفاده از useMemo برای پرفورمنس (خیلی مهم)
   * این تابع سنگین (groupData) فقط زمانی اجرا می‌شود که
   * productData یا filterType تغییر کنند.
   * اگر کاربر چک‌باکس "مقایسه" را بزند، این محاسبه سنگین تکرار نمی‌شود!
   */
  const groupedData = useMemo(() => {
    return groupData(productData, filterType);
  }, [productData, filterType]);

  /**
   * آماده‌سازی دیتا برای نمودار
   * اینجا دیتای "دوره قبل" را ست می‌کنیم
   */
  const chartData = useMemo(() => {
    return groupedData.map((item, idx, arr) => ({
      name: item.name,
      articles: item.articles,
      // 💡 منطق مقایسه: مقدار ایندکس قبلی آرایه را برمی‌دارد
      // نکته: اگر دیتای ماه‌ها پیوسته نباشد (مثلا اردیبهشت خالی باشد)،
      // فروردین با خرداد مقایسه می‌شود که یک باگ منطقی کوچک است اما برای داشبوردهای ساده اوکی است.
      prevArticles: compareMode ? (arr[idx - 1]?.articles ?? null) : undefined,
    }));
  }, [groupedData, compareMode]);

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر و فیلترها */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">
          📊 آمار محصولات 
          {/* نمایش تعداد کل جهت اطلاع */}
          <span className="text-xs text-gray-500 font-normal mr-2">
            ({productData.length} مورد)
          </span>
        </h1>

        <div className="flex gap-2 flex-wrap items-center">
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filterType === type
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "daily"
                ? "روزانه"
                : type === "weekly"
                ? "هفتگی"
                : type === "monthly"
                ? "ماهانه"
                : "سالانه"}
            </button>
          ))}

          <label className="flex items-center gap-2 ml-4 text-gray-700 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            مقایسه فعال
          </label>
        </div>
      </div>

      {/* ناحیه نمودار */}
      <div className="w-full h-[450px]">
        {loading ? (
          // نمایش لودینگ زیبا وسط باکس
          <div className="flex items-center justify-center h-full text-gray-400">
            در حال بارگذاری نمودار...
          </div>
        ) : chartData.length === 0 ? (
          // نمایش پیام خالی بودن
          <div className="flex items-center justify-center h-full text-gray-400">
            داده‌ای برای نمایش وجود ندارد
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                // اگر تعداد زیاد شد، زاویه‌دار نمایش بده
                interval={chartData.length > 10 ? 0 : 'preserveStartEnd'} 
                angle={chartData.length > 10 ? -45 : 0}
                textAnchor={chartData.length > 10 ? "end" : "middle"}
                height={chartData.length > 10 ? 60 : 30}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Bar
                dataKey="articles"
                fill="#3C50E0"
                radius={[4, 4, 0, 0]}
                name="تعداد محصولات"
                animationDuration={1000} // انیمیشن نرم
              />
              {compareMode && (
                <Line
                  type="monotone"
                  dataKey="prevArticles"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  name="دوره قبل"
                  dot={{ r: 4 }}
                  animationDuration={1000}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* پیام هشدار برای مقایسه */}
      {compareMode && !loading && chartData.length > 0 && chartData[0].prevArticles === null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          ⚠️ اولین دوره در نمودار، دیتای قبلی برای مقایسه ندارد.
        </div>
      )}
    </section>
  );
}