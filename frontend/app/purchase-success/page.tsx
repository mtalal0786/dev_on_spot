"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type ConfirmResp =
  | { ok: true; transaction: { _id: string; status: string; stripe?: { receiptUrl?: string } } }
  | { ok: false; status: string; session?: any }
  | { error: string };

export default function PurchaseSuccessPage() {
  const search = useSearchParams();
  const router = useRouter();
  const sessionId = search.get("session_id");

  const [state, setState] = useState<"idle"|"confirming"|"ok"|"notpaid"|"error">("idle");
  const [message, setMessage] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setMessage("Missing session_id in URL.");
      return;
    }

    const run = async () => {
      setState("confirming");
      try {
        const res = await fetch(`${API_BASE}/api/transactions/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
          cache: "no-store",
        });
        const data: ConfirmResp = await res.json();

        if ("error" in data) {
          setState("error");
          setMessage(data.error || "Failed to confirm payment.");
          return;
        }

        if (data.ok) {
          setState("ok");
          setReceiptUrl(data.transaction?.stripe?.receiptUrl || null);
          // optional auto-redirect to billing after 2s
          setTimeout(() => router.push("/billing"), 2000);
        } else {
          setState("notpaid");
          setMessage(`Payment status: ${data.status}`);
        }
      } catch {
        setState("error");
        setMessage("Network error confirming payment.");
      }
    };

    run();
  }, [sessionId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">Purchase Success</h1>

        {state === "confirming" && <p>Verifying your payment…</p>}

        {state === "ok" && (
          <>
            <p className="text-green-600">Payment confirmed! Redirecting to Billing…</p>
            {receiptUrl && (
              <p>
                <a className="text-primary underline" href={receiptUrl} target="_blank" rel="noreferrer">
                  View receipt
                </a>
              </p>
            )}
          </>
        )}

        {state === "notpaid" && (
          <>
            <p className="text-amber-600">{message || "Payment not completed yet."}</p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 border rounded"
            >
              Retry confirmation
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <p className="text-red-600">{message || "Something went wrong."}</p>
            <button onClick={() => router.push("/plans")} className="px-4 py-2 border rounded">
              Back to Plans
            </button>
          </>
        )}
      </div>
    </div>
  );
}
