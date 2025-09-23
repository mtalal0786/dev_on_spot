import mongoose from "mongoose";

const { Schema } = mongoose;

// IPv4 with optional /CIDR (0–32)
const ipv4OrCidr = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\/(?:3[0-2]|[12]?\d))?$/;
// ISO 3166-1 alpha-2 country codes (2 letters)
const iso2 = /^[A-Z]{2}$/;

const securityListSchema = new Schema(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SecurityPlan",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Blocklist", "Allowlist", "Geo Block"],
      required: true,
      index: true,
    },

    // CHANGED: was Number — now array of strings with per-type validation
    entries: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr) || arr.length === 0) return false;

          if (this.type === "Geo Block") {
            // Country codes like "US", "PK", "GB"
            return arr.every((v) => typeof v === "string" && iso2.test(v.trim().toUpperCase()));
          }

          // Blocklist/Allowlist → IPv4 or IPv4/CIDR
          return arr.every((v) => typeof v === "string" && ipv4OrCidr.test(v.trim()));
        },
        message:
          'entries must be a non-empty array of values valid for the selected type. For "Geo Block": ISO country codes (e.g., ["US","PK"]). For "Blocklist"/"Allowlist": IPv4 or IPv4/CIDR (e.g., ["1.2.3.4","5.6.7.0/24"]).',
      },
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// keep lastUpdated in sync on saves/updates
securityListSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

securityListSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastUpdated: new Date() });
  next();
});

export default mongoose.model("SecurityList", securityListSchema);
