import stripe from "../config/stripe.js";
import { listTransactions, markPaidFromStripe, recordPendingFromSession } from "../services/transactions.js";

/** GET /api/transactions  (protect) — Admin sees all; User sees own only */
export async function getTransactions(req, res) {
  try {
    const page     = Number(req.query.page)     || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const status   = req.query.status;

    const q = {};
    if (status) q.status = status;
    if (req.user?.role === "Admin") {
      if (req.query.userId) q.userId = req.query.userId;
    } else {
      q.userId = req.user._id;
    }

    const data = await listTransactions({ q, page, pageSize });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

/** POST /api/transactions/confirm {session_id} — finalize payment (no webhook) */
export async function confirmPaymentNoWebhook(req, res) {
  try {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Ensure we have a pending record
    await recordPendingFromSession({
      userId: session.metadata?.userId,
      packageId: session.metadata?.packageId,
      session
    });

    if (session.payment_status !== "paid") {
      return res.json({ ok: false, status: session.payment_status, session });
    }

    const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ["latest_charge"] });
    const tx = await markPaidFromStripe({ session, paymentIntent: pi });

    // (Optional) call your entitlement logic here
    // await grantPurchase(session.metadata?.userId, session.metadata?.packageId, session);

    res.json({ ok: true, transaction: tx });
  } catch (e) {
    console.error("confirmPaymentNoWebhook error:", e);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
}
