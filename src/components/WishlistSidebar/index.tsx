// components/WishlistSidebar
"use client";

import Link from "next/link";
import Image from "next/image";
import { XMarkIcon, HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";

const WishlistSidebar = () => {
  const { isWishlistModalOpen, toggleWishlistModal } = useWishlistModalContext();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useAppDispatch();

  return (
    <>
      {/* بک دراپ */}
      <div
        onClick={toggleWishlistModal}
        className={`fixed inset-0 bg-dark/50 backdrop-blur-sm z-[10000] transition-all
        ${isWishlistModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      {/* سایدبار */}
      <div
        className={`fixed top-0 left-0 h-full w-[360px] bg-white z-[10001] shadow-2xl transition-all duration-300
        ${isWishlistModalOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">

          {/* هدر */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <HeartIcon className="w-6 h-6 text-red" />
              <h3 className="font-bold">علاقه‌مندی‌ها</h3>
            </div>
            <button onClick={toggleWishlistModal}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* محتوا */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {wishlistItems.length === 0 ? (
              <p className="text-center text-sm text-gray-500">لیست علاقه‌مندی خالی است</p>
            ) : (
              wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-3 border rounded-lg p-3">
                  <Image
                    src={item.imgs?.thumbnails[0]}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.discountedPrice} دلار</p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => dispatch(addItemToCart({ ...item, quantity: 1 }))}
                        className="text-xs bg-blue text-white px-3 py-1 rounded"
                      >
                        افزودن به سبد
                      </button>

                      <button
                        onClick={() => dispatch(removeItemFromWishlist(item.id))}
                        className="text-xs text-red"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* فوتر */}
          <div className="border-t p-4">
            <Link
              onClick={toggleWishlistModal}
              href="/wishlist"
              className="flex items-center justify-center gap-2 bg-dark text-white py-3 rounded-full text-sm font-bold"
            >
              مشاهده لیست کامل
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default WishlistSidebar;
