import { Schema, model } from 'mongoose';

const firewallSchema = new Schema(
  {
    name: { type: String, required: true },
    vpc: { type: String, required: true },
    region: { type: String, required: true },
    rules: { type: Number, required: true },
    openPorts: { type: Number, required: true },
    blocked24h: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active', index: true },
  },
  { timestamps: true }
);

export default model('Firewall', firewallSchema);
