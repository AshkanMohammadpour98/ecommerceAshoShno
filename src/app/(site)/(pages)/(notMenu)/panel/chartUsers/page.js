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
 * 💡 تابع ایمن برای تجزیه تاریخ
 * این تابع جلوی کرش کردن را می‌گیرد اگر فرمت تاریخ اشتباه باشد یا null باشد.
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  // استخراج اعداد سال، ماه و روز از هر رشته‌ای (با جداکننده / یا -)
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
 * بیرون از کامپوننت تعریف شده تا در هر رندر دوباره ساخته نشود.
 */
function groupData(userData, type) {
  const count = {};

  userData.forEach((item) => {
    // 💡 استفاده از dateLogin (تاریخ عضویت/ورود)
    if (!item.dateLogin) return;

    const parsed = parseDate(item.dateLogin);
    if (!parsed) return; // اگر تاریخ نامعتبر بود، نادیده بگیر

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

    count[key] = (count[key] || 0) + 1;
  });

  // مرتب‌سازی کلیدها (تاریخ‌ها)
  const sortedKeys = Object.keys(count).sort((a, b) => {
    const cleanA = a.replace("-هفته ", "/");
    const cleanB = b.replace("-هفته ", "/");
    return cleanA.localeCompare(cleanB);
  });

  return sortedKeys.map((key) => ({
    name: key,
    users: count[key],
  }));
}

// ------------------ Custom Tooltip ------------------
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow border text-sm space-y-1 z-50">
        <div className="font-medium text-gray-800">{data.name}</div>
        <div className="text-blue-600">تعداد کاربران: {data.users}</div>
        {data.prevUsers !== undefined && (
          <div className="text-gray-500">
            دوره قبل: {data.prevUsers !== null ? data.prevUsers : "داده‌ای نیست"}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ------------------ کامپوننت اصلی ------------------
export default function ChartUsers() {
  const [userData, setUserData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true); // 💡 وضعیت بارگذاری

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در شبکه");
        return res.json();
      })
      .then((data) => {
        // 💡 بررسی ساختار دیتای دریافتی
        const safeData = data.data || (Array.isArray(data) ? data : []);
        setUserData(safeData);
      })
      .catch((err) => {
        console.error("خطا در دریافت کاربران:", err);
        setUserData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * 💡 بهینه‌سازی پرفورمنس با useMemo
   * جلوگیری از محاسبه مجدد گروه‌بندی هنگام تغییر چک‌باکس مقایسه
   */
  const groupedData = useMemo(() => {
    return groupData(userData, filterType);
  }, [userData, filterType]);

  /**
   * آماده‌سازی دیتا برای چارت و اضافه کردن ستون "دوره قبل"
   */
  const chartData = useMemo(() => {
    return groupedData.map((item, idx, arr) => ({
      name: item.name,
      users: item.users,
      // مقایسه با ایندکس قبلی آرایه
      prevUsers: compareMode ? (arr[idx - 1]?.users ?? null) : undefined,
    }));
  }, [groupedData, compareMode]);

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر و کنترل‌ها */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">
          👥 آمار کاربران
          {!loading && (
            <span className="text-xs text-gray-500 font-normal mr-2">
              (کل: {userData.length})
            </span>
          )}
        </h1>

        <div className="flex gap-2 flex-wrap items-center">
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
                ${
                  filterType === type
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
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
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            مقایسه فعال
          </label>
        </div>
      </div>

      {/* ناحیه نمودار */}
      <div className="w-full h-[450px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
            در حال بارگذاری نمودار...
          </div>
        ) : chartData.length === 0 ? (
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
                tick={{ fontSize: 12, fill: '#666' }}
                // تنظیم خودکار زاویه متن اگر دیتا زیاد باشد
                interval={chartData.length > 12 ? 0 : 'preserveStartEnd'}
                angle={chartData.length > 12 ? -45 : 0}
                textAnchor={chartData.length > 12 ? "end" : "middle"}
                height={chartData.length > 12 ? 60 : 30}
              />
              <YAxis tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Legend verticalAlign="top" height={36} />
              
              <Bar
                dataKey="users"
                fill="#3C50E0"
                radius={[4, 4, 0, 0]}
                name="تعداد کاربران"
                animationDuration={1500}
              />
              
              {compareMode && (
                <Line
                  type="monotone"
                  dataKey="prevUsers"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  name="دوره قبل"
                  dot={{ r: 4, fill: '#FF6B6B', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* هشدار مقایسه */}
      {compareMode && !loading && chartData.length > 0 && chartData[0].prevUsers === null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
          <span>⚠️</span>
          <span>اولین دوره در نمودار، داده‌ای برای مقایسه با قبل ندارد.</span>
        </div>
      )}
    </section>
  );
}