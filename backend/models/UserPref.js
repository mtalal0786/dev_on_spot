import mongoose from "mongoose";

const userPrefSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    email: { type: String }, // user's email
    emailAlertsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("UserPref", userPrefSchema);
