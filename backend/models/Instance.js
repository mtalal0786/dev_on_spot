import mongoose from "mongoose";

const InstanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  region: { type: String, required: true },
  profile: { type: String, enum: ["web","db","gpu"], default: "web" },
  status: { type: String, enum: ["Running","Stopped","Pending","Terminated"], default: "Running", index: true },
  cpu:   { type: Number, default: 0 },
  ram:   { type: Number, default: 0 },
  gpu:   { type: Number, default: 0 },
  disk:  { type: Number, default: 0 },
  netIn: { type: Number, default: 0 },  // KB/s
  netOut:{ type: Number, default: 0 },  // KB/s
  uptimeSec: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Instance", InstanceSchema);
