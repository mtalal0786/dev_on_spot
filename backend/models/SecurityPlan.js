// models/SecurityPlan.js
import mongoose from 'mongoose';

const securityPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  owner: { type: String, required: true },
  mode: { type: String, enum: ['Monitor', 'Enforce'], default: 'Monitor' },
  targets: [{ type: String }],
  status: { type: String, enum: ['OK', 'Warning', 'Critical'], default: 'OK' },
  ruleCount: { type: Number, default: 0 }, // Replace rules with ruleCount
  lists: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SecurityPlan = mongoose.model('SecurityPlan', securityPlanSchema);
export default SecurityPlan;