import mongoose from 'mongoose';

const trafficLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to Project model
  method: { type: String, required: true }, // e.g., 'GET', 'POST'
  path: { type: String, required: true },
  status: { type: String, enum: ['ALLOW', 'BLOCK'], required: true },
  statusCode: { type: Number, required: true },
  ip: { type: String, required: true },
  country: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const TrafficLog = mongoose.model('TrafficLog', trafficLogSchema);
export default TrafficLog;