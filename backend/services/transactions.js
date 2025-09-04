import Transaction from "../models/Transactions.js";

export async function recordPendingFromSession({ userId, packageId, session }) {
  return Transaction.findOneAndUpdate(
    { "stripe.sessionId": session.id },
    {
      userId,
      packageId,
      amount: session.amount_total ?? session.amount_subtotal ?? 0,
      currency: session.currency || "usd",
      status: "pending",
      stripe: {
        customerId: session.customer ?? undefined,
        sessionId:  session.id,
      },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function markPaidFromStripe({ session, paymentIntent }) {
  const latestCharge = paymentIntent?.latest_charge && typeof paymentIntent.latest_charge === "object"
    ? paymentIntent.latest_charge
    : null;

  const receiptUrl = latestCharge?.receipt_url || null;
  const chargeId   = latestCharge?.id || null;

  return Transaction.findOneAndUpdate(
    {
      $or: [
        { "stripe.paymentIntentId": paymentIntent?.id || "__none__" },
        { "stripe.sessionId": session?.id || "__none__" },
      ],
    },
    {
      $set: {
        amount:   session?.amount_total ?? paymentIntent?.amount ?? 0,
        currency: session?.currency || paymentIntent?.currency || "usd",
        status:   "paid",
        stripe: {
          customerId:      session?.customer || undefined,
          sessionId:       session?.id || undefined,
          paymentIntentId: paymentIntent?.id || undefined,
          chargeId,
          receiptUrl,
        },
      },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function listTransactions({ q = {}, page = 1, pageSize = 20 }) {
  const skip = (Math.max(page,1) - 1) * Math.max(pageSize,1);
  const [items, total] = await Promise.all([
    Transaction.find(q)
      .populate("userId","name email")
      .populate("packageId","name price currency")
      .sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Transaction.countDocuments(q)
  ]);
  return { items, total, page, pageSize };
}
