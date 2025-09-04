import mongoose from "mongoose";
import Package from "../models/Package.js";
import User from "../models/userSchema.js";

export async function getPackageById(packageId) {
  if (!mongoose.Types.ObjectId.isValid(packageId)) return null;
  return await Package.findById(packageId).lean();
}

export async function getOrCreateStripeCustomerIdForUser(uid, emailHint = null) {
  if (!mongoose.Types.ObjectId.isValid(uid)) throw new Error("Invalid user id");
  const user = await User.findById(uid).lean();
  if (!user) throw new Error("User not found");
  return { customerId: user.stripeCustomerId || null, email: user.email || emailHint || null };
}

export async function saveStripeCustomerIdToUser(uid, customerId) {
  if (!mongoose.Types.ObjectId.isValid(uid)) throw new Error("Invalid user id");
  await User.updateOne({ _id: uid }, { $set: { stripeCustomerId: customerId } });
}
