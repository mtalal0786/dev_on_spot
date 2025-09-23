import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: String, default: "system" },
    action: { type: String, required: true },    // e.g. UPDATE_RULE, CREATE_PLAN
    resource: { type: String, required: true },  // e.g. SecurityRule:65ab..., Plan:...
    changes: { type: String, default: "" },      // JSON string diff
    ip: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
