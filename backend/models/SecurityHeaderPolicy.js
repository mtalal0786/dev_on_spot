import mongoose from "mongoose";

// Updated schema to accept hsts as an object
const securityHeaderPolicySchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecurityPlan",
      required: true,
      index: true,
    },

    // Change hsts to be an object
    hsts: {
      type: Object,  // Changed from Boolean to Object
      default: { enabled: true, maxAge: 31536000, includeSubdomains: true, preload: true },
    },
    
    // Keep csp as it is, but if needed, follow the same approach as hsts
    csp: {
      type: Object,
      default: { enabled: true, policy: "default-src 'self'; script-src 'self' cdn.example.com" },
    },

    xFrameOptions: { type: Boolean, default: true },
    xContentTypeOptions: { type: Boolean, default: true },
    minTlsVersion: { type: String, default: "TLS1.2" },
    forceHttps: { type: Boolean, default: true },
    ocspStapling: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("SecurityHeaderPolicy", securityHeaderPolicySchema);
