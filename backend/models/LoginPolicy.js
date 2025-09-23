import mongoose from "mongoose";

const loginPolicySchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SecurityPlan", required: true, index: true },
    accountLockout: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 5 },   // failed attempts
      duration: { type: Number, default: 15 },   // minutes
    },
    mfa: {
      enabled: { type: Boolean, default: false },
      methods: { type: [String], default: [] },  // ["TOTP", "SMS", "Email"]
    },
  },
  { timestamps: true }
);

export default mongoose.model("LoginPolicy", loginPolicySchema);
