import mongoose from "mongoose";

const rateLimitPolicySchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecurityPlan",
      required: true,
      index: true,
    },
    // CHANGED: Updated to accept an object with 'requests' and 'windowSec'
    globalLimit: {
      type: Map,
      of: Number,
      default: { requests: 1000, windowSec: 60 },
    },
    // CHANGED: Updated to accept an object with 'requests', 'windowSec', and 'burst'
    perIpLimit: {
      type: Map,
      of: Number,
      default: { requests: 100, windowSec: 60, burst: 20 },
    },
    loginLimit: { type: String, default: "5/minute" },
    action: { type: String, enum: ["Block", "Challenge"], default: "Block" },
    duration: { type: String, default: "15m" },
  },
  { timestamps: true }
);

export default mongoose.model("RateLimitPolicy", rateLimitPolicySchema);
