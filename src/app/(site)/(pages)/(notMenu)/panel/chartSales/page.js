"use client";

import { useEffect, useState } from "react";
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

// 📅 کمک برای کار با تاریخ شمسی
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("/").map((n) => parseInt(n, 10));
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
}

// 📘 گروه‌بندی داده‌ها بر اساس نوع فیلتر + محاسبه درآمد
function groupSalesData(purchases, type) {
  const data = {};

  purchases.forEach((item) => {
    const { year, month, day } = parseDate(item.dateSlase);
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
        key = `${year}/${month}`;
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

    // ✅ افزایش تعداد فروش
    data[key].count += 1;

    // ✅ محاسبه قیمت واقعی محصول
    let finalPrice = item.price || 0;
    if (item.hasDiscount && item.discountedPrice) {
      finalPrice = item.discountedPrice;
    }
    data[key].revenue += finalPrice;
  });

  const sortedKeys = Object.keys(data).sort((a, b) => {
    const da = parseDate(a + (type === "yearly" ? "/01/01" : ""));
    const db = parseDate(b + (type === "yearly" ? "/01/01" : ""));
    return da.year - db.year || da.month - db.month || da.day - db.day;
  });

  return sortedKeys.map((key) => ({
    name: key,
    totalSales: data[key].count,
    totalRevenue: data[key].revenue,
  }));
}

// 📋 Tooltip سفارشی
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded shadow border text-sm space-y-1">
        <div className="font-bold text-gray-800">{data.name}</div>
        <div className="text-green-600">💰 درآمد: {data.totalRevenue?.toLocaleString()} تومان</div>
        <div className="text-blue-600">📦 تعداد فروش: {data.totalSales}</div>
        {data.prevSales !== undefined && (
          <div className="text-gray-600">
            دوره قبل:{" "}
            {data.prevSales !== null ? data.prevSales : "دیتای کافی نیست"}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ChartSales() {
  const [userData, setUserData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/usersData")
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch(() => setUserData([]));
  }, []);

  /**
   * 📦 ساخت آرایه مرکزی از خریدها
   * - اگر کاربر `PurchasedProducts` نداره → نادیده گرفته میشه
   * - برای هر محصول:
   *   - تاریخ از `dateSlase`
   *   - قیمت اگر تخفیف داره از `discountedPrice` وگرنه `price`
   */
  const allPurchases = userData.flatMap((user) => {
    if (!user.PurchasedProducts || user.PurchasedProducts.length === 0) {
      return [];
    }

    return user.PurchasedProducts.map((product) => ({
      dateSlase: product.dateSlase,
      price: product.price || 0,
      discountedPrice: product.discountedPrice || 0,
      hasDiscount: product.hasDiscount || false,
    }));
  });

  // ⏰ گروه‌بندی بر اساس نوع بازه
  const groupedData = groupSalesData(allPurchases, filterType);

  // 🔁 آماده‌سازی برای مقایسه نمودار
  const chartData = groupedData.map((item, idx, arr) => ({
    name: item.name,
    totalSales: item.totalSales,
    totalRevenue: item.totalRevenue,
    prevSales: compareMode ? arr[idx - 1]?.totalSales ?? null : undefined,
  }));

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر و فیلتر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">
          💰 آمار فروش و درآمد
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

          {/* سوییچ مقایسه */}
          <label className="flex items-center gap-2 ml-4 text-gray-700 text-sm">
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

      {/* نمودار */}
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* 📦 تعداد فروش */}
            <Bar
              yAxisId="left"
              dataKey="totalSales"
              fill="#00B894"
              radius={[4, 4, 0, 0]}
              name="تعداد فروش"
            />

            {/* 💰 درآمد */}
            <Bar
              yAxisId="right"
              dataKey="totalRevenue"
              fill="#FDCB6E"
              radius={[4, 4, 0, 0]}
              name="درآمد (تومان)"
            />

            {/* 🔁 مقایسه دوره قبل */}
            {compareMode && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="prevSales"
                stroke="#FF7675"
                strokeWidth={2}
                name="دوره قبل"
                dot={{ r: 4 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* هشدار داده ناقص */}
      {compareMode && chartData.some((i) => i.prevSales === null) && (
        <div className="text-sm text-red-600">
          ⚠️ بعضی مقایسه‌ها دیتای کافی برای دوره قبل ندارند!
        </div>
      )}
    </section>
  );
}