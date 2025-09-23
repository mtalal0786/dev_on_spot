// models/Scan.js
import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  scanId: { type: String, unique: true, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  progress: { type: Number, default: 0 },
  filesScanned: { type: Number, default: 0 },
  threatsFound: { type: Number, default: 0 },
  vulnerabilities: { type: Number, default: 0 },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;