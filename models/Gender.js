import { Schema, model, models } from "mongoose";

const genderSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
    },
    products: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Gender = models.Gender || model("Gender", genderSchema);

export default Gender;
