import { Schema, model, models } from "mongoose";

/**
 * ===============================
 * 🟢 Schema نظرات کاربران (Comments)
 * ===============================
 * هر سند = یک نظر کاربر
 */
const commentSchema = new Schema(
  {
    // 🟢 متن نظر کاربر
    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    // 🟢 نام نویسنده نظر
    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟢 تصویر نویسنده (آواتار)
    authorImg: {
      type: String,
      required: true,
      default: "/images/users/default-user.png",
    },

    // 🟢 نقش یا عنوان نویسنده (مثلاً: کارآفرین، مشتری، مدیر و ...)
    authorRole: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟡 id فرانت (اختیاری)
    // اگر در UI به id جدا از _id نیاز داشتی
    id: {
      type: String,
      index: true,
    },
  },
  {
    // 🟡 زمان ساخت و ویرایش به صورت خودکار
    timestamps: true,
  }
);

// جلوگیری از ساخته شدن دوباره مدل در Next.js
const Comments = models.Comments || model("Comments", commentSchema);

export default Comments;
