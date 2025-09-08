import mongoose from "mongoose";

const QuotaSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  used: { type: Number, default: 0 },
  allocated: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Quota", QuotaSchema);
