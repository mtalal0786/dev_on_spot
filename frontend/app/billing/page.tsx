"use client";

import { useEffect, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { ThemeProvider } from "../../components/theme-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
const money = (cents: number, cur: string) =>
  (cents / 100).toLocaleString(undefined, { style: "currency", currency: cur?.toUpperCase?.() || "USD" });

type Tx = {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  packageId?: { _id: string; name: string; price: number; currency: string };
  amount: number;
  currency: string;
  status: string;
  stripe?: { receiptUrl?: string };
  createdAt: string;
};

export default function BillingPage() {
  const [items, setItems] = useState<Tx[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (p = 1) => {
    setLoading(true);
    setErr("");
    try {
      const headers = authHeaders();
      const res = await fetch(`${API_BASE}/api/transactions?page=${p}&pageSize=${pageSize}`, {
        headers: Object.keys(headers).length ? headers : undefined,
        cache: "no-store",
      });
      if (res.status === 401) {
        setErr("Please sign in to view transactions.");
        setItems([]);
        setTotal(0);
        setPage(1);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch {
      setErr("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const canPrev = page > 1;
  const canNext = page * pageSize < total;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false}/>
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Billing</h1>

            {err && <p className="text-red-500 mb-4">{err}</p>}

            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Package</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-3" colSpan={6}>
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td className="p-3" colSpan={6}>
                        No transactions.
                      </td>
                    </tr>
                  )}
                  {items.map((tx) => (
                    <tr key={tx._id} className="border-t">
                      <td className="p-3">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="p-3">
                        {tx.userId?.name || "—"}{" "}
                        {tx.userId?.email ? <span className="text-muted-foreground">({tx.userId.email})</span> : null}
                      </td>
                      <td className="p-3">{tx.packageId?.name || "—"}</td>
                      <td className="p-3">{money(tx.amount, tx.currency)}</td>
                      <td className="p-3 capitalize">{tx.status}</td>
                      <td className="p-3">
                        {tx.stripe?.receiptUrl ? (
                          <a className="text-primary underline" href={tx.stripe.receiptUrl} target="_blank">
                            Receipt
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => load(page - 1)}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={!canNext}
                onClick={() => load(page + 1)}
              >
                Next
              </button>
              <span className="text-muted-foreground ml-2">
                Page {page} • {total} total
              </span>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
