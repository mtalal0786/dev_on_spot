// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dev_on_spot";
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message || err);
    process.exit(1);
  }
};

export default connectDB;
