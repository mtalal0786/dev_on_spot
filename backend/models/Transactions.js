import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    amount:    { type: Number, required: true },  // cents
    currency:  { type: String, required: true },  // "usd"
    status:    { type: String, enum: ["pending","paid","failed","refunded","canceled"], default: "pending", index: true },
    stripe: {
      customerId:      { type: String },
      sessionId:       { type: String, unique: true, sparse: true },
      paymentIntentId: { type: String, unique: true, sparse: true },
      chargeId:        { type: String },
      receiptUrl:      { type: String },
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
