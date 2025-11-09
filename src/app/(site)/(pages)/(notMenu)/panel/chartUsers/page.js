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

// ------------------ توابع کمکی برای کار با تاریخ ------------------

// تبدیل تاریخ شمسی از رشته به شیء (برای مرتب‌سازی و گروه‌بندی)
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("/").map((n) => parseInt(n, 10));
  return { year, month, day };
}

// ساخت فرمت مرتب YYYY/MM/DD
function formatDate({ year, month, day }) {
  return `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
}

// گروه‌بندی کاربران براساس نوع (روزانه، هفتگی، ماهانه، سالانه)
function groupData(userData, type) {
  const count = {};

  userData.forEach((item) => {
    const { year, month, day } = parseDate(item.dateLogin); // استفاده از dateLogin برای گروه‌بندی
    let key = "";

    switch (type) {
      case "daily":
        key = formatDate({ year, month, day });
        break;
      case "weekly":
        const week = Math.ceil(day / 7); // محاسبه هفته تقویمی
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

  // مرتب‌سازی کلیدها (بر اساس سال، ماه، روز)
  const sortedKeys = Object.keys(count).sort((a, b) => {
    const da = parseDate(a + (type === "yearly" ? "/01/01" : ""));
    const db = parseDate(b + (type === "yearly" ? "/01/01" : ""));
    return da.year - db.year || da.month - db.month || da.day - db.day;
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
      <div className="bg-white p-2 rounded shadow border text-sm space-y-1">
        <div className="font-medium">{data.name}</div>
        <div>تعداد کاربران: {data.users}</div>
        {data.prevUsers !== undefined && (
          <div>دوره قبل: {data.prevUsers ?? "دیتای کافی نیست"}</div>
        )}
      </div>
    );
  }
  return null;
};

// ------------------ کامپوننت اصلی ------------------
export default function ChartUsers() {
  const [userData, setUserData] = useState([]); // ذخیره دیتا
  const [filterType, setFilterType] = useState("monthly"); // نوع فیلتر (پیش‌فرض ماهانه)
  const [compareMode, setCompareMode] = useState(false); // حالت مقایسه فعال یا نه

  // گرفتن دیتای کاربران از API زمانی که کامپوننت لود می‌شود
  useEffect(() => {
    fetch("http://localhost:3001/usersData")
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch(() => setUserData([]));
  }, []);

  // گروه‌بندی دیتا بر اساس نوع انتخاب‌شده
  const groupedData = groupData(userData, filterType);

  // آماده‌سازی دیتا برای نمایش در نمودار
  const chartData = groupedData.map((item, idx, arr) => ({
    name: item.name,
    users: item.users,
    prevUsers: compareMode ? arr[idx - 1]?.users ?? null : undefined,
  }));

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">👥 آمار کاربران</h1>

        {/* دکمه‌های فیلتر */}
        <div className="flex gap-2 flex-wrap items-center">
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all
                ${
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

          {/* حالت مقایسه */}
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
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="users"
              fill="#3C50E0"
              radius={[4, 4, 0, 0]}
              name="تعداد کاربران"
            />
            {compareMode && (
              <Line
                type="monotone"
                dataKey="prevUsers"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="دوره قبل"
                dot={{ r: 4 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* پیام هشدار برای نبود دیتای مقایسه */}
      {compareMode && chartData.some((item) => item.prevUsers === null) && (
        <div className="text-sm text-red-600">
          ⚠️ بعضی مقایسه‌ها دیتای کافی برای دوره قبل ندارند!
        </div>
      )}
    </section>
  );
}