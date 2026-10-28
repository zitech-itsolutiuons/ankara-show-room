import mongoose from "mongoose";

// Uploaded images are stored in MongoDB so the admin works on any host (no disk needed).
const MediaSchema = new mongoose.Schema(
  {
    filename: String,
    contentType: { type: String, required: true },
    size: Number,
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
