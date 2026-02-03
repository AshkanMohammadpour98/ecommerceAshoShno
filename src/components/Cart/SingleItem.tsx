import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
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

// 🎯 فرمت قیمت به تومان
const formatMoney = (n: number) =>
  `${new Intl.NumberFormat("fa-IR").format(n)} تومان`;

const SingleItem = ({ item }: { item: any }) => {
  // 🧮 استیت محلی برای تعداد
  const [quantity, setQuantity] = useState<number>(item.quantity || 1);

  // 📤 دسترسی به dispatch ریداکس
  const dispatch = useDispatch<AppDispatch>();

  // ⛔ غیرفعال کردن دکمه کاهش وقتی تعداد = 1
  const decDisabled = quantity <= 1;

  // ❌ حذف کامل محصول از سبد
  const handleRemoveFromCart = () => {
    Swal.fire({
      title: "حذف محصول",
      text: "آیا از حذف این محصول مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeItemFromCart(item.id));
        Swal.fire("حذف شد", "محصول از سبد خرید حذف شد", "success");
      }
    });
  };

  // ➕ افزایش تعداد (با کنترل موجودی انبار)
  const handleIncreaseQuantity = () => {
    // 🧠 بررسی سقف موجودی
    if (item.count && quantity >= item.count) {
      Swal.fire({
        icon: "error",
        title: "موجودی محدود",
        text: `حداکثر تعداد قابل سفارش ${item.count} عدد می‌باشد`,
        confirmButtonText: "باشه",
      });
      return;
    }

    const next = quantity + 1;

    // 🔄 آپدیت state محلی
    setQuantity(next);

    // 🔄 آپدیت مقدار در ریداکس
    dispatch(updateCartItemQuantity({ id: item.id, _id: item._id , quantity: next }));
  };

  // ➖ کاهش تعداد
  const handleDecreaseQuantity = () => {
    if (decDisabled) return;

    const next = Math.max(1, quantity - 1);

    setQuantity(next);
    dispatch(updateCartItemQuantity({ id: item.id, _id : item._id , quantity: next }));
  };

  // 💰 محاسبه قیمت واحد (در صورت وجود تخفیف)
  const unitPrice = item.discountedPrice || item.price || 0;

  // 🧾 محاسبه جمع جزء
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

              {/* متادیتا اختیاری مثل رنگ / سایز */}
              {item?.variantTitle && (
                <p className="mt-1 text-dark-4 text-custom-xs">
                  {item.variantTitle}
                </p>
              )}

              {/* نمایش موجودی */}
              {item?.count && (
                <p className="mt-1 text-green-600 text-xs">
                  موجودی: {item.count} عدد
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ستون: قیمت واحد */}
      <div className="min-w-[180px]">
        <p className="text-dark">{formatMoney(unitPrice)}</p>
      </div>

      {/* ستون: تعداد */}
      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3 overflow-hidden">
          <button
            onClick={handleDecreaseQuantity}
            disabled={decDisabled}
            className={`flex items-center justify-center w-11.5 h-11.5 transition-colors ${
              decDisabled
                ? "text-gray-4 cursor-not-allowed"
                : "hover:text-blue"
            }`}
          >
            <MinusSmallIcon className="w-5 h-5" />
          </button>

          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 text-dark">
            {new Intl.NumberFormat("fa-IR").format(quantity)}
          </span>

          <button
            onClick={handleIncreaseQuantity}
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

      {/* ستون: حذف */}
      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemoveFromCart}
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
