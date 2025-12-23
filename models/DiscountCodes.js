import { Schema, model, models } from "mongoose";

/**
 * ===============================
 * DiscountCodes Schema
 * ===============================
 * این مدل برای نگهداری کدهای تخفیف و مبلغ آن‌ها استفاده می‌شود
 */
const discountCodeSchema = new Schema(
  {
    // id فرانت (در صورت نیاز برای sync)
    id: {
      type: String,
      index: true,
    },

    // مبلغ تخفیف
    money: {
      type: Number,
      required: true,
      min: 0,
    },

    // کد تخفیف
    discountCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true, // هر کد تخفیف یکتا باشد
    },
  },
  {
    timestamps: true, // createdAt , updatedAt
  }
);

const DiscountCodes =
  models.DiscountCodes || model("DiscountCodes", discountCodeSchema);

export default DiscountCodes;
