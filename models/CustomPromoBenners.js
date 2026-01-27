import { models , model , Schema } from "mongoose";

const customPromoBennerSchema = new Schema(
     {
    _id : {
      type : String,
    },
    // 🟢   تبلیغ محصول مشتری عنوان اصلی بنر
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    // 🟢 زیرعنوان (متن کوتاه زیر title)
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟢 توضیحات کامل بنر
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟢 متن دکمه (مثلاً: مشاهده محصول)
    buttonText: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟢 لینک دکمه (URL یا route داخلی)
    buttonLink: {
      type: String,
      required: true,
      trim: true,
    },

    // 🟢 آدرس تصویر بنر
    image: {
      type: String,
      required: true,
    },

    // 🟢 رنگ پس‌زمینه بنر (hex / class / name)
    bgColor: {
      type: String,
      required: true,
    },

    // 🟢 رنگ دکمه
    // enum باعث می‌شود فقط مقادیر مجاز ذخیره شوند
    buttonColor: {
      type: String,
      enum: ["blue", "teal", "orange"],
      required: true,
    },
  },
  {
    // 🟡 createdAt و updatedAt به‌صورت خودکار
    timestamps: true,
  }
)

const CustomPromoBenners = models.CustomPromoBenners || model( 'CustomPromoBenners' , customPromoBennerSchema )

export default CustomPromoBenners