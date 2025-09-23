import { Schema, model } from 'mongoose';

const loginAttemptSchema = new Schema(
  {
    user: String,
    ip: String,
    method: String,
    result: { type: String, enum: ['Success', 'Failed'], index: true },
    reason: String,
    time: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default model('LoginAttempt', loginAttemptSchema);
