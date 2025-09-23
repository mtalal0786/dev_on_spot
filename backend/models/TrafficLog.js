// models/TrafficLog.js
import mongoose from 'mongoose';

const trafficLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  status: { type: String, enum: ['ALLOW', 'BLOCK'], required: true },
  statusCode: { type: Number, required: true },
  ip: { type: String, required: true },
  country: { type: String, required: true },
  rule: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  referrer: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const TrafficLog = mongoose.model('TrafficLog', trafficLogSchema);
export default TrafficLog;