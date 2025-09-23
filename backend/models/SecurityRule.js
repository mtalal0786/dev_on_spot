import mongoose from 'mongoose';

const securityRuleSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityPlan', required: true },
    type: { type: String, required: true }, // "Inbound" or "Outbound"
    protocol: { type: String, required: true },
    portRange: { type: String, required: true },
    source: { type: String }, // Only for inbound rules
    destination: { type: String }, // Only for outbound rules
    description: { type: String },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    priority: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('SecurityRule', securityRuleSchema);
