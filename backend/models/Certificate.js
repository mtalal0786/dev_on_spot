import mongoose from "mongoose";

const { Schema } = mongoose;

const certificateSchema = new Schema(
  {
    domain: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Valid", "Expiring", "Expired"],
      default: "Valid",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
