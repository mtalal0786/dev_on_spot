import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema(
  {
    severity: { type: String, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"], required: true, index: true },
    message: { type: String, required: true },
    detail: { type: String },
    source: { type: String, enum: ["WAF", "IDS", "Auth", "CDN"], default: "WAF" },
    status: { type: String, enum: ["Open", "Acknowledged", "Resolved"], default: "Open", index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("SecurityAlert", securityAlertSchema);
