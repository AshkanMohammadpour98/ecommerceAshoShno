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
  CartesianGrid,
} from "recharts";

/**
 * 💡 تابع پارس تاریخ (ایمن و مقاوم)
 * این تابع تاریخ‌های شمسی را تجزیه می‌کند و اگر فرمت خراب باشد، null برمی‌گرداند.
 */
// urls
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USERS_URL = process.env.NEXT_PUBLIC_API_USERS_URL;

// تابع پارس تاریخ
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
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
 * 💡 تابع گروه‌بندی و محاسبه فروش
 * این تابع لیست تمام خریدهای یک‌کاسه شده را می‌گیرد و بر اساس زمان گروه‌بندی می‌کند.
 */
function groupSalesData(purchases, type) {
  const data = {};

  purchases.forEach((item) => {
    // 💡 استفاده از dateSlase (طبق دیتای شما)
    const dateStr = item.dateSlase || item.date; 
    const parsed = parseDate(dateStr);
    
    if (!parsed) return; // اگر تاریخ نداشت، رد شو

    const { year, month, day } = parsed;
    let key = "";

    switch (type) {
      case "daily":
        key = formatDate({ year, month, day });
        break;
      case "weekly":
        const week = Math.ceil(day / 7);
        key = `${year}/${month}-هفته ${week}`;
        break;
      case "monthly":
        key = `${year}/${month.toString().padStart(2, "0")}`;
        break;
      case "yearly":
        key = `${year}`;
        break;
      default:
        key = formatDate({ year, month, day });
    }

    if (!data[key]) {
      data[key] = { count: 0, revenue: 0 };
    }

    // ✅ ۱. افزایش تعداد فروش
    data[key].count += 1;

    // ✅ ۲. محاسبه قیمت (با لحاظ کردن تخفیف)
    // تبدیل به عدد برای جلوگیری از جمع رشته‌ای "100" + "200" = "100200"
    let finalPrice = Number(item.price) || 0;
    if (item.hasDiscount && item.discountedPrice) {
      finalPrice = Number(item.discountedPrice) || 0;
    }
    data[key].revenue += finalPrice;
  });

  // مرتب‌سازی کلیدها (تاریخ‌ها)
  const sortedKeys = Object.keys(data).sort((a, b) => {
    const cleanA = a.replace("-هفته ", "/");
    const cleanB = b.replace("-هفته ", "/");
    return cleanA.localeCompare(cleanB);
  });

  return sortedKeys.map((key) => ({
    name: key,
    totalSales: data[key].count,
    totalRevenue: data[key].revenue,
  }));
}

// ------------------ Custom Tooltip ------------------
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm space-y-2 z-50">
        <div className="font-bold text-gray-800 border-b pb-1 mb-1">{data.name}</div>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600">تعداد فروش:</span>
          <span className="font-bold text-gray-900">{data.totalSales}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-gray-600">درآمد کل:</span>
          <span className="font-bold text-gray-900">
            {data.totalRevenue?.toLocaleString()} <span className="text-xs font-normal">تومان</span>
          </span>
        </div>

        {data.prevSales !== undefined && (
          <div className="text-gray-400 text-xs mt-1 pt-1 border-t">
             فروش دوره قبل: {data.prevSales ?? "---"}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ------------------ کامپوننت اصلی ------------------
export default function ChartSales() {
  const [userData, setUserData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}${USERS_URL}`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در شبکه");
        return res.json();
      })
      .then((data) => {
        const safeData = data.data || (Array.isArray(data) ? data : []);
        setUserData(safeData);
      })
      .catch((err) => {
        console.error("خطا:", err);
        setUserData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * 💡 مرحله ۱: استخراج تمام خریدها (Flatten Data)
   * ما لیستی از کاربران داریم، اما برای نمودار فروش، لیستی از "خریدها" نیاز داریم.
   * این `useMemo` آرایه‌های تودرتوی PurchasedProducts را بیرون می‌کشد و یک آرایه صاف می‌سازد.
   */
  const allPurchases = useMemo(() => {
    return userData.flatMap((user) => {
      // اگر کاربر خریدی نداشته، آرایه خالی برگردان
      if (!user.PurchasedProducts || !Array.isArray(user.PurchasedProducts)) {
        return [];
      }
      return user.PurchasedProducts;
    });
  }, [userData]);

  /**
   * 💡 مرحله ۲: گروه‌بندی خریدها بر اساس زمان
   * فقط وقتی لیست خریدها یا نوع فیلتر عوض شود اجرا می‌شود.
   */
  const groupedData = useMemo(() => {
    return groupSalesData(allPurchases, filterType);
  }, [allPurchases, filterType]);

  /**
   * 💡 مرحله ۳: آماده‌سازی نهایی برای چارت (افزودن مقایسه)
   */
  const chartData = useMemo(() => {
    return groupedData.map((item, idx, arr) => ({
      name: item.name,
      totalSales: item.totalSales,
      totalRevenue: item.totalRevenue,
      // مقایسه تعداد فروش با دوره قبل
      prevSales: compareMode ? (arr[idx - 1]?.totalSales ?? null) : undefined,
    }));
  }, [groupedData, compareMode]);

  // محاسبه مجموع درآمد کل برای نمایش در هدر
  const totalRevenueAllTime = useMemo(() => 
    allPurchases.reduce((sum, item) => {
       const price = item.hasDiscount ? (Number(item.discountedPrice) || 0) : (Number(item.price) || 0);
       return sum + price;
    }, 0)
  , [allPurchases]);

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            💰 آمار فروش و درآمد
          </h1>
          {!loading && (
             <p className="text-sm text-gray-500 mt-1">
               مجموع درآمد کل: <span className="font-bold text-green-600">{totalRevenueAllTime.toLocaleString()} تومان</span>
             </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "daily" ? "روزانه" : type === "weekly" ? "هفتگی" : type === "monthly" ? "ماهانه" : "سالانه"}
            </button>
          ))}

          <label className="flex items-center gap-2 ml-4 text-gray-700 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            مقایسه فروش
          </label>
        </div>
      </div>

      {/* نمودار */}
      <div className="w-full h-[450px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
            در حال پردازش آمار فروش...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            هنوز خریدی ثبت نشده است
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#666' }}
                interval={chartData.length > 12 ? 0 : 'preserveStartEnd'}
                angle={chartData.length > 12 ? -45 : 0}
                textAnchor={chartData.length > 12 ? "end" : "middle"}
                height={chartData.length > 12 ? 60 : 30}
              />

              {/* محور سمت چپ: تعداد فروش */}
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#00B894" 
                tick={{ fontSize: 12 }}
                label={{ value: 'تعداد', angle: -90, position: 'insideLeft', fill: '#00B894' }}
              />

              {/* محور سمت راست: درآمد (تومان) */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#FDCB6E" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}k`} // نمایش خلاصه (مثلا 100k)
                label={{ value: 'درآمد', angle: 90, position: 'insideRight', fill: '#FDCB6E' }}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Legend verticalAlign="top" height={36} />

              {/* میله تعداد فروش */}
              <Bar
                yAxisId="left"
                dataKey="totalSales"
                fill="#00B894" // سبز
                radius={[4, 4, 0, 0]}
                name="تعداد فروش"
                barSize={30}
                animationDuration={1500}
              />

              {/* میله درآمد */}
              <Bar
                yAxisId="right"
                dataKey="totalRevenue"
                fill="#FDCB6E" // زرد/طلایی
                radius={[4, 4, 0, 0]}
                name="درآمد (تومان)"
                barSize={30}
                animationDuration={1500}
              />

              {/* خط مقایسه تعداد فروش دوره قبل */}
              {compareMode && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="prevSales"
                  stroke="#FF7675" // قرمز روشن
                  strokeWidth={2}
                  name="فروش دوره قبل"
                  dot={{ r: 4, fill: '#FF7675', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {compareMode && !loading && chartData.length > 0 && chartData[0].prevSales === null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
           ⚠️ اولین دوره نمودار، سابقه‌ای برای مقایسه ندارد.
        </div>
      )}
    </section>
  );
}