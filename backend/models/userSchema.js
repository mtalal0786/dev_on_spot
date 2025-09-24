import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Editor", "User"], default: "User" },

    isEmailVerified: { type: Boolean, default: false },

    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    lastLoginAt: { type: Date, default: null },

    stripeCustomerId: { type: String, default: null },

    // Referral fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      immutable: true,   // 🚫 never changes after first set
      index: true
    },
    referralCount: { type: Number, default: 0 },
    referralPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure unique index exists (safe if already created)
UserSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

// Hash password if modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Helper to generate a short, readable, unique code (improved for fixed length and entropy)
export async function generateUniqueReferralCode(Model) {
  for (let i = 0; i < 7; i++) {
    const code = crypto
      .randomBytes(8)                     // Increased to 8 bytes for better entropy
      .toString("hex")                    // Hex for fixed alnum (0-9A-F)
      .toUpperCase()                      // Uppercase for readability (A-F0-9)
      .slice(0, 10);                      // Exactly 10 chars

    const exists = await Model.exists({ referralCode: code });
    if (!exists) return code;
  }
  // Last resort fallback (still short & unique enough)
  return ("USER" + Date.now().toString(36).toUpperCase()).slice(0, 10);
}

// Generate permanent referral code on first save (if absent)
UserSchema.pre("save", async function (next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode(this.constructor);
  }
  next();
});

export default mongoose.model("User", UserSchema);