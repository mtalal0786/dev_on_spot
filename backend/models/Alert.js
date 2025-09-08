import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  instanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Instance", index: true },
  type: { type: String, required: true },       // "CPU", "Memory", "GPU", ...
  metricKey: { type: String, required: true },  // cpu | ram | gpu | disk | netIn | netOut
  severity: { type: String, enum: ["low","medium","high"], default: "low", index: true },
  threshold: { type: Number, required: true },
  value: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model("Alert", AlertSchema);
