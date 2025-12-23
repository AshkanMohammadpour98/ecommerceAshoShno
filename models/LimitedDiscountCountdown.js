import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| Limited Discount Schema (Simple)
|--------------------------------------------------------------------------
| اسکیما ساده برای تخفیف زمان‌دار
| دقیقاً مطابق با داده‌هایی که در فرانت استفاده می‌شود
*/

const LimitedDiscountSchema = new mongoose.Schema(
  {
    // آیدی محصول
    productId: {
      type: String,
      required: true,
    },

    // تاریخ شروع
    startedAt: {
      type: Date,
      required: true,
    },

    // تاریخ پایان
    endsAt: {
      type: Date,
      required: true,
    },

    // متن بنر تخفیف
    description: {
      type: String,
      required: true,
    },
  },
  {
    // زمان ایجاد و آپدیت
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
| جلوگیری از خطای OverwriteModelError در Next.js
*/

export default mongoose.models.LimitedDiscount ||
  mongoose.model("LimitedDiscount", LimitedDiscountSchema);
