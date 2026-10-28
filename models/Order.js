import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderRef: { type: String, required: true, unique: true },
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    variantKey: { type: String, required: true },
    variantName: { type: String, required: true },
    size: { type: String, enum: ["S", "M", "L", "XL", "Custom"], required: true },
    customSize: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 1, max: 10 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "cancelled"], default: "pending" },
  },
  { timestamps: true } // createdAt = order timestamp
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
