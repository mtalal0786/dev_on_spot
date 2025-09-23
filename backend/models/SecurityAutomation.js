import mongoose from "mongoose";

const securityAutomationSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SecurityPlan", required: true, index: true },
    name: { type: String, required: true },

    // Change from String to Object to support the structure of "trigger" and "action"
    trigger: {
      type: Object,  // Changed from String to Object
      required: true,
    },

    action: {
      type: Object,  // Changed from String to Object
      required: true,
    },

    status: { type: String, enum: ["Active", "Disabled"], default: "Active", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("SecurityAutomation", securityAutomationSchema);
