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

// کمک برای مرتب کردن تاریخ شمسی
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("/").map((n) => parseInt(n, 10));
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
}

// گروه‌بندی داده‌ها
function groupData(productData, type) {
  const count = {};
  productData.forEach((item) => {
    const { year, month, day } = parseDate(item.date);
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
    count[key] = (count[key] || 0) + 1;
  });

  const sortedKeys = Object.keys(count).sort((a, b) => {
    const da = parseDate(a + (type === "yearly" ? "/01/01" : ""));
    const db = parseDate(b + (type === "yearly" ? "/01/01" : ""));
    return da.year - db.year || da.month - db.month || da.day - db.day;
  });

  return sortedKeys.map((key) => ({ name: key, articles: count[key] }));
}

// Tooltip پیشرفته
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow border text-sm space-y-1">
        <div className="font-medium">{data.name}</div>
        <div>تعداد محصولات: {data.articles}</div>
        {data.prevArticles !== undefined && (
          <div>دوره قبل: {data.prevArticles ?? "دیتای کافی نیست"}</div>
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

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProductData(data))
      .catch(() => setProductData([]));
  }, []);

  const groupedData = groupData(productData, filterType);

  const chartData = groupedData.map((item, idx, arr) => ({
    name: item.name,
    articles: item.articles,
    prevArticles: compareMode ? (arr[idx - 1]?.articles ?? null) : undefined,
  }));

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">📊 آمار محصولات</h1>

        <div className="flex gap-2 flex-wrap items-center">
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                filterType === type ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"
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

      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="articles" fill="#3C50E0" radius={[4, 4, 0, 0]} name="تعداد محصولات" />
            {compareMode && (
              <Line
                type="monotone"
                dataKey="prevArticles"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="دوره قبل"
                dot={{ r: 4 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {compareMode && chartData.some((item) => item.prevArticles === null) && (
        <div className="text-sm text-red-600">
          ⚠️ بعضی مقایسه‌ها دیتای کافی برای دوره قبل ندارند!
        </div>
      )}
    </section>
  );
}
