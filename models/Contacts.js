import { Schema, model, models } from "mongoose";

/**
 * ===============================
 * Contact Schema
 * ===============================
 * این مدل برای ذخیره اطلاعات تماس سایت استفاده می‌شود
 * مانند نام، شماره تماس، ایمیل و آدرس
 */
const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "نام الزامی است"],
      minlength: 3,
      maxlength: 30,
      trim: true, // حذف فاصله‌های اضافی ابتدا و انتها
    },
        categoryJob: {
      type: String,
      required: [true, "نوع شغل  الزامی است"],
      minlength: 3,
      maxlength: 30,
      trim: true, // حذف فاصله‌های اضافی ابتدا و انتها
    },

    phone: {
      type: String, // شماره تلفن حتما String باشد
      required: [true, "شماره موبایل الزامی است"],
      match: [/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر نیست"],
    },

    landlinePhone: {
      type: String,
      match: [/^\d{8,11}$/, "شماره تلفن ثابت معتبر نیست"],
    },

    email: {
      type: String,
      required: [true, "ایمیل الزامی است"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "ایمیل معتبر نیست"],
    },

    address: {
      type: String,
      minlength: 8,
      trim: true,
    },
    logo: {
      type: String, // می‌تونه URL یا مسیر عکس روی سرور باشه
      trim: true,
      default: "", 
    },

    isActive: {
      type: Boolean,
      default: true, // برای فعال / غیرفعال کردن نمایش اطلاعات تماس
    },
  },
  {
    timestamps: true, // createdAt , updatedAt
  }
);

const Contacts =
  models.Contacts || model("Contacts", contactSchema);

export default Contacts;
