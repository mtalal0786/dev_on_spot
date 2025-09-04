import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // cents
    currency: { type: String, default: "usd" },
    type: { type: String, enum: ["one-time", "subscription"], default: "one-time" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

PackageSchema.index({ status: 1 });

export default mongoose.models.Package || mongoose.model("Package", PackageSchema);
