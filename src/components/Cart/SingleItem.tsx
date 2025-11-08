import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";
import {
  TrashIcon,
  MinusSmallIcon,
  PlusSmallIcon,
} from "@heroicons/react/24/outline";

const formatMoney = (n: number) => `${new Intl.NumberFormat("fa-IR").format(n)} تومان`;

const SingleItem = ({ item }: { item: any }) => {
  const [quantity, setQuantity] = useState<number>(item.quantity || 1);
  const dispatch = useDispatch<AppDispatch>();

  const decDisabled = quantity <= 1;

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => {
      const next = prev + 1;
      dispatch(updateCartItemQuantity({ id: item.id, quantity: next }));
      return next;
    });
  };

  const handleDecreaseQuantity = () => {
    if (decDisabled) return;
    setQuantity((prev) => {
      const next = Math.max(1, prev - 1);
      dispatch(updateCartItemQuantity({ id: item.id, quantity: next }));
      return next;
    });
  };

  const unitPrice = item.discountedPrice || 0;
  const lineTotal = unitPrice * quantity;

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5" dir="rtl">
      {/* ستون: محصول */}
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5 overflow-hidden">
              <Image
                width={80}
                height={80}
                src={item?.imgs?.thumbnails?.[0] || "/images/placeholder.png"}
                alt={item?.title ? `تصویر ${item.title}` : "محصول"}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-dark hover:text-blue ease-out duration-200 truncate">
                <Link href={item.link || "#"}>{item.title}</Link>
              </h3>
              {/* متادیتا اختیاری مثل رنگ/سایز */}
              {item?.variantTitle && (
                <p className="mt-1 text-dark-4 text-custom-xs">{item.variantTitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ستون: قیمت واحد */}
      <div className="min-w-[180px]">
        <p className="text-dark">{formatMoney(unitPrice)}</p>
      </div>

      {/* ستون: تعداد (استپر) */}
      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3 overflow-hidden">
          <button
            onClick={handleDecreaseQuantity}
            aria-label="کاهش تعداد"
            disabled={decDisabled}
            className={`flex items-center justify-center w-11.5 h-11.5 transition-colors ${
              decDisabled ? "text-gray-4 cursor-not-allowed" : "hover:text-blue"
            }`}
          >
            <MinusSmallIcon className="w-5 h-5" />
          </button>

          <span
            className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 text-dark"
            aria-live="polite"
          >
            {new Intl.NumberFormat("fa-IR").format(quantity)}
          </span>

          <button
            onClick={handleIncreaseQuantity}
            aria-label="افزایش تعداد"
            className="flex items-center justify-center w-11.5 h-11.5 hover:text-blue transition-colors"
          >
            <PlusSmallIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ستون: جمع جزء */}
      <div className="min-w-[200px]">
        <p className="text-dark font-medium">{formatMoney(lineTotal)}</p>
      </div>

      {/* ستون: عملیات */}
      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          aria-label={`حذف ${item?.title || "محصول"} از سبد`}
          title="حذف از سبد"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark transition-colors hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SingleItem;