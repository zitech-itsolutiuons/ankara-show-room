import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    brandName: String,
    headline1: String,
    headline2: String,
    description: String,
    contactEmail: String,
    seoTitle: String,
    seoDescription: String,
    canonicalUrl: String,
    seoSocialImage: String,
    googleVerification: String,
    allowIndexing: Boolean,
    scrollChange: Boolean,
    scrollStep: Number,
    scrollExitCorner: String,
    scrollTransitionDuration: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
