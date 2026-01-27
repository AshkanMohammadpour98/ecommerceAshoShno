"use client";

import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { SparklesIcon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"; // 🔹 اضافه کردن آیکون برای دکمه مشاهده همه
import {
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} from "@/redux/features/wishlist-slice";

const WishlistSidebarModal = () => {
  const { isWishlistModalOpen, toggleWishlistModal } =
    useWishlistModalContext();

  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-all ${
        isWishlistModalOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={toggleWishlistModal}
        className="absolute inset-0 bg-dark/70 backdrop-blur-[1px]"
      />

      {/* Sidebar */}
      <div
        className={`absolute top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white shadow-3 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isWishlistModalOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-3">
          <h3 className="font-semibold text-lg text-dark">لیست علاقه‌مندی‌ها</h3>

          <div className="flex items-center gap-2">
            {/* 🔹 بهبود دکمه حذف همه: کوچک‌تر و ظریف‌تر در هدر */}
            {wishlistItems.length > 0 && (
              <button
                onClick={() => dispatch(removeAllItemsFromWishlist())}
                className="px-2 py-1 text-red text-xs font-bold hover:bg-red/5 rounded transition"
              >
                حذف همه
              </button>
            )}

            <button
              onClick={toggleWishlistModal}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-2 hover:bg-gray-3 transition"
            >
              <XMarkIcon className="w-5 h-5 text-dark" />
            </button>
          </div>
        </div>

        {/* Body - 🔹 اضافه شدن اسکرول داخلی برای لیست‌های طولانی */}
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-light-5 rounded-full animate-pulse" />
                <div className="relative bg-gradient-to-br from-gray-2 to-gray-3 rounded-full p-6 sm:p-8 shadow-3">
                  <svg
                    className="fill-current w-6 h-6"
                    width="25"
                    height="25"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z"
                      fill=""
                    />
                  </svg>
                  <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-dark mt-4">
                علاقه مندی های شما خالی است!
              </h3>
              <p className="text-custom-sm sm:text-base text-meta-4 mt-2 px-6">
                محصولات مورد علاقه خود را اضافه کنید تا مقایسه و خرید را تجربه کنید
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 group"
                >
                  <div className="w-full flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-xl bg-gray-3 w-20 h-20 overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imgs?.thumbnails[0]}
                        alt={item.title || "product"}
                        width={80}
                        height={80}
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-dark mb-1 line-clamp-1 hover:text-blue transition">
                        <Link href={`/shop-details/${item._id}`} onClick={toggleWishlistModal}>
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs font-bold text-blue">
                        {item.discountedPrice
                          ? item.discountedPrice.toLocaleString()
                          : item.price.toLocaleString()}{" "}
                        تومان
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => dispatch(removeItemFromWishlist(item.id))}
                    aria-label="حذف محصول"
                    className="flex items-center justify-center rounded-lg w-9 h-9 bg-gray-2 border border-gray-3 text-dark hover:bg-red/10 hover:border-red/20 hover:text-red transition"
                  >
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 22 22">
                      <path d="M9.45017 2.06252H12.5498C12.7482 2.06239 12.921 2.06228 13.0842 2.08834C13.7289 2.19129 14.2868 2.59338 14.5883 3.17244C14.6646 3.319 14.7192 3.48298 14.7818 3.6712L14.8841 3.97819C14.9014 4.03015 14.9064 4.04486 14.9105 4.05645C15.0711 4.50022 15.4873 4.80021 15.959 4.81217C15.9714 4.81248 15.9866 4.81254 16.0417 4.81254H18.7917C19.1714 4.81254 19.4792 5.12034 19.4792 5.50004C19.4792 5.87973 19.1714 6.18754 18.7917 6.18754H3.20825C2.82856 6.18754 2.52075 5.87973 2.52075 5.50004C2.52075 5.12034 2.82856 4.81254 3.20825 4.81254H5.95833C6.01337 4.81254 6.02856 4.81248 6.04097 4.81217C6.51273 4.80021 6.92892 4.50024 7.08944 4.05647C7.09366 4.0448 7.09852 4.03041 7.11592 3.97819L7.21823 3.67122C7.28083 3.48301 7.33538 3.319 7.41171 3.17244C7.71324 2.59339 8.27112 2.19129 8.91581 2.08834C9.079 2.06228 9.25181 2.06239 9.45017 2.06252Z" />
                      <path d="M5.42208 7.74597C5.39683 7.36711 5.06923 7.08047 4.69038 7.10572C4.31152 7.13098 4.02487 7.45858 4.05013 7.83743L4.47496 14.2099C4.55333 15.3857 4.61663 16.3355 4.76511 17.0808C4.91947 17.8557 5.18203 18.5029 5.72432 19.0103C6.26662 19.5176 6.92987 19.7365 7.7133 19.839C8.46682 19.9376 9.41871 19.9376 10.5971 19.9375H11.4028C12.5812 19.9376 13.5332 19.9376 14.2867 19.839C15.0701 19.7365 15.7334 19.5176 16.2757 19.0103C16.818 18.5029 17.0805 17.8557 17.2349 17.0808C17.3834 16.3355 17.4467 15.3857 17.525 14.2099L17.9499 7.83743C17.9751 7.45858 17.6885 7.13098 17.3096 7.10572C16.9308 7.08047 16.6032 7.36711 16.5779 7.74597L16.1563 14.0702C16.0739 15.3057 16.0152 16.1654 15.8864 16.8122C15.7614 17.4396 15.5869 17.7717 15.3363 18.0062C15.0857 18.2406 14.7427 18.3926 14.1084 18.4756C13.4544 18.5612 12.5927 18.5625 11.3545 18.5625H10.6455C9.40727 18.5625 8.54559 18.5612 7.89164 18.4756C7.25731 18.3926 6.91433 18.2406 6.6637 18.0062C6.41307 17.7717 6.2386 17.4396 6.11361 16.8122C5.98476 16.1654 5.92607 15.3057 5.8437 14.0702L5.42208 7.74597Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - 🔹 بخش جدید برای لینک به صفحه لیست علاقه‌مندی‌ها */}
        {wishlistItems.length > 0 && (
          <div className="p-4 border-t border-gray-3 bg-white">
            <Link
              href="/wishlist"
              onClick={toggleWishlistModal}
              className="flex items-center justify-center gap-2 w-full py-4 bg-dark text-white rounded-xl font-bold hover:bg-blue transition-all group"
            >
              <span>نمایش کامل تر و مقایسه این محصولات</span>
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              شما {wishlistItems.length} محصول در لیست دارید
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistSidebarModal;