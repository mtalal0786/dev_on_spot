import stripe from "../config/stripe.js";
import {
  getPackageById,
  getOrCreateStripeCustomerIdForUser,
  saveStripeCustomerIdToUser,
} from "../services/data.js";
import { recordPendingFromSession } from "../services/transactions.js";

const badBody = (req) => ({
  message: "Body was not parsed as JSON. Use Content-Type: application/json.",
  contentType: req.headers["content-type"] || null,
  bodyType: typeof req.body,
});

/**
 * POST /api/payments/checkout/session
 * Body: { packageId, successUrl, cancelUrl }
 * Auth: Bearer token required
 */
export const createCheckoutSession = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid JSON body", details: badBody(req) });
    }
    if (!req.user?._id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { packageId, successUrl, cancelUrl } = req.body || {};
    const uid = String(req.user._id);

    if (!packageId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: "packageId, successUrl, and cancelUrl are required",
        got: { packageId, successUrl, cancelUrl },
      });
    }

    // 1) Package
    const pkg = await getPackageById(packageId);
    if (!pkg || pkg.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive package" });
    }
    const { name, price, currency = "usd", type } = pkg;

    // 2) Stripe customer
    let { customerId, email } = await getOrCreateStripeCustomerIdForUser(uid, null);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { userId: uid },
      });
      customerId = customer.id;
      await saveStripeCustomerIdToUser(uid, customerId);
    }

    // 3) Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency,
          unit_amount: price, // cents
          product_data: {
            name,
            metadata: { packageId, type },
          },
        },
        quantity: 1,
      }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { userId: uid, packageId, packageType: type || "one-time" },
    });

    // 4) Record pending
    await recordPendingFromSession({ userId: uid, packageId, session });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
};

/**
 * GET /api/payments/checkout/session?session_id=cs_...
 * Optional helper to check payment status client-side (also auth-protected).
 */
export const getCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query || {};
    if (!session_id) return res.status(400).json({ error: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["payment_intent"] });
    const paid    = session.payment_status === "paid" || session?.payment_intent?.status === "succeeded";
    res.status(200).json({ paid, session });
  } catch (err) {
    console.error("getCheckoutSession error:", err);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
};
