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
 * 💡 تابع پارس تاریخ (ایمن شده)
 * این تابع طوری نوشته شده که اگر فرمت تاریخ خراب بود (مثلا - داشت یا null بود) برنامه کرش نکند.
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  // استخراج اعداد با Regex (هم / و هم - را ساپورت می‌کند)
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
 * بیرون از کامپوننت است تا در هر بار رندر شدن کامپوننت، دوباره ساخته نشود.
 */
function groupData(blogData, type) {
  const count = {};

  blogData.forEach((item) => {
    // اگر بلاگی تاریخ نداشت، رد شو
    if (!item.date) return;

    const parsed = parseDate(item.date);
    if (!parsed) return;

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

  // مرتب‌سازی زمانی کلیدها
  const sortedKeys = Object.keys(count).sort((a, b) => {
    const cleanA = a.replace("-هفته ", "/");
    const cleanB = b.replace("-هفته ", "/");
    return cleanA.localeCompare(cleanB);
  });

  return sortedKeys.map((key) => ({ name: key, articles: count[key] }));
}

// ------------------ Custom Tooltip ------------------
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow border text-sm space-y-1 z-50">
        <div className="font-medium text-gray-800">{data.name}</div>
        <div className="text-blue-600">تعداد مقاله: {data.articles}</div>
        {data.prevArticles !== undefined && (
          <div className="text-gray-500">
            دوره قبل: {data.prevArticles !== null ? data.prevArticles : "داده‌ای نیست"}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ------------------ کامپوننت اصلی ------------------
export default function ChartBlogs() {
  const [blogData, setBlogData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true); // 💡 وضعیت بارگذاری

  useEffect(() => {
    fetch("http://localhost:3000/api/blogs")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در ارتباط با سرور");
        return res.json();
      })
      .then((data) => {
        // 💡 استخراج ایمن دیتا (چه داخل data باشد چه آرایه مستقیم)
        const safeData = data.data || (Array.isArray(data) ? data : []);
        setBlogData(safeData);
      })
      .catch((err) => {
        console.error("خطا در دریافت بلاگ‌ها:", err);
        setBlogData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * 💡 بهینه‌سازی پرفورمنس با useMemo
   * فقط زمانی که لیست بلاگ‌ها یا نوع فیلتر عوض شود محاسبه انجام می‌شود
   */
  const groupedData = useMemo(() => {
    return groupData(blogData, filterType);
  }, [blogData, filterType]);

  /**
   * آماده‌سازی دیتا برای چارت (افزودن مقایسه)
   */
  const chartData = useMemo(() => {
    return groupedData.map((item, idx, arr) => ({
      name: item.name,
      articles: item.articles,
      // مقایسه با دوره قبلی (ایندکس قبلی)
      prevArticles: compareMode ? (arr[idx - 1]?.articles ?? null) : undefined,
    }));
  }, [groupedData, compareMode]);

  return (
    <section className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6 max-h-screen overflow-y-auto">
      {/* هدر و کنترل‌ها */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-bold text-lg text-gray-800">
          📊 آمار بلاگ‌ها
          {!loading && (
            <span className="text-xs text-gray-500 font-normal mr-2">
              (کل: {blogData.length})
            </span>
          )}
        </h1>

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
                // اگر دیتا زیاد بود، متن‌ها را کج کن تا خوانا باشند
                interval={chartData.length > 12 ? 0 : 'preserveStartEnd'}
                angle={chartData.length > 12 ? -45 : 0}
                textAnchor={chartData.length > 12 ? "end" : "middle"}
                height={chartData.length > 12 ? 60 : 30}
              />
              <YAxis tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Legend verticalAlign="top" height={36} />
              
              <Bar
                dataKey="articles"
                fill="#3C50E0" // رنگ آبی
                radius={[4, 4, 0, 0]}
                name="تعداد مقاله"
                animationDuration={1500}
              />
              
              {compareMode && (
                <Line
                  type="monotone"
                  dataKey="prevArticles"
                  stroke="#FF6B6B" // رنگ قرمز
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

      {/* هشدار برای نبود دیتای مقایسه */}
      {compareMode && !loading && chartData.length > 0 && chartData[0].prevArticles === null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
          <span>⚠️</span>
          <span>برای اولین دوره در نمودار، دیتای قبلی جهت مقایسه وجود ندارد.</span>
        </div>
      )}
    </section>
  );
}