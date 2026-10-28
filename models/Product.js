import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    categoryId: { type: String, default: "kaftans" },
    tagline: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    pattern: { type: String, enum: ["rings", "diamonds", "bars", "fans"], default: "rings" },
    palette: { type: [String], default: [] }, // 4 hex colours used to draw the pattern
    theme: {
      from: String,
      via: String,
      to: String,
      glow: String,
    },
    backdrop: {
      shape: { type: String, enum: ["none", "circle", "arch", "square"], default: "circle" },
      color: { type: String, default: "#ffffff" },
      opacity: { type: Number, default: 0.1, min: 0, max: 0.6 },
    },
    image: { type: String, default: "" }, // uploaded photo (/api/media/...) or https URL; replaces the generated artwork
    imageScale: { type: Number, default: 100, min: 100, max: 175 },
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    currency: { type: String, default: "NGN" },
    sizes: { type: [String], default: ["S", "M", "L", "XL", "Custom"] },
    categories: { type: [CategorySchema], default: [] },
    variants: { type: [VariantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
