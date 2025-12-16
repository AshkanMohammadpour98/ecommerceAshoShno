import Link from "next/link";
import React from "react";

const LatestPosts = ({ blogs }) => {
  // اعتبارسنجی ورودی
  if (!Array.isArray(blogs) || blogs.length === 0) {
    return null; // اگر آرایه نبود یا خالی بود چیزی نمایش نده
  }

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">آخرین پست‌ها</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {blogs.slice(0, 3).map((blog, key) => (
            <div className="flex items-center gap-4" key={key}>
              
              {/* لینک داینامیک به صفحه جزئیات همان پست */}
              <Link
                href={`/blogs/${blog._id}`} 
                className="max-w-[110px] w-full rounded-[10px] overflow-hidden shrink-0" // shrink-0 added for layout stability
              >
                {blog?.img ? (
                  <img
                    src={blog.img}
                    alt={blog.title || "blog image"}
                    className="rounded-[10px] w-full h-[80px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[80px] bg-gray-200 rounded-[10px]" />
                )}
              </Link>

              <div>
                <h3 className="text-dark leading-[22px] ease-out duration-200 mb-1.5 hover:text-blue line-clamp-2">
                  <Link href={`/blogs/${blog.id}`}>
                    {blog?.title}
                  </Link>
                </h3>

                <span className="flex items-center gap-3 text-gray-500">
                  <span className="text-custom-xs">
                    {blog?.date}
                  </span>
                  {/* فقط اگر ویو وجود داشت نمایش بده */}
                  {blog?.views && (
                    <>
                      <span className="block w-px h-4 bg-gray-4"></span>
                      <span className="text-custom-xs">
                        {blog.views} بازدید
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestPosts;