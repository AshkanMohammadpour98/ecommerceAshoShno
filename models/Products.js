import { models, model, Schema } from "mongoose";

const productsSchema = new Schema(
  {
    // id فرانت
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    categorie: {
      type: String,
      required: true,
      trim: true,
    },

    count: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    hasDiscount: {
      type: Boolean,
      default: false,
    },

    date: {
      type: String, // چون شمسیه
      required: true,
    },

    SuggestedCategories: {
      type: [String],
      default: [],
    },

    imgs: {
      thumbnails: {
        type: [String],
       
      },
      previews: {
        type: [String],
        
      },
    },

    QRDatas: {
      id: String,
      name: String,
      config: Schema.Types.Mixed,
      preview: {
        url: String,
        width: Number,
        height: Number,
        mime: String,
      },
      dateAddQrCode: String,
    },
  },
  {
    timestamps: true, // createdAt , updatedAt
  }
);

const Products = models.Products || model("Products", productsSchema);
export default Products;
