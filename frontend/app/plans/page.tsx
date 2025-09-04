"use client";

import { useEffect, useMemo, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { ThemeProvider } from "../../components/theme-provider";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type Role = "Admin" | "Editor" | "User";
type Pkg = {
  _id: string;
  name: string;
  price: number;        // cents
  currency: string;
  type: "one-time" | "subscription";
  status: "active" | "inactive";
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  name: string;
  priceDollars: string; // input for humans
  currency: string;
  type: "one-time" | "subscription";
  status: "active" | "inactive";
  featuresText: string; // one per line
};

function normalizeRole(r: any): Role | null {
  const s = (r ?? "").toString().trim().toLowerCase();
  if (s === "admin") return "Admin";
  if (s === "editor") return "Editor";
  if (s === "user") return "User";
  return null;
}

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const money = (cents: number, cur: string) =>
  (cents / 100).toLocaleString(undefined, { style: "currency", currency: (cur || "USD").toUpperCase() });

function pkgToForm(p?: Pkg): FormState {
  if (!p) return { name: "", priceDollars: "", currency: "usd", type: "one-time", status: "active", featuresText: "" };
  return {
    name: p.name,
    priceDollars: (p.price / 100).toString(),
    currency: p.currency || "usd",
    type: p.type || "one-time",
    status: p.status || "active",
    featuresText: (p.features || []).join("\n"),
  };
}

function parsePriceToCents(input: string): number | null {
  const n = Number(input);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PlansPage() {
  // ---- role state
  const [role, setRole] = useState<Role | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const isAdmin = role === "Admin";

  // ---- plans lists
  const [activePackages, setActivePackages] = useState<Pkg[]>([]);
  const [gridErr, setGridErr] = useState("");

  const [allPackages, setAllPackages] = useState<Pkg[]>([]);
  const [adminErr, setAdminErr] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // ---- buy / modal
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [form, setForm] = useState<FormState>(pkgToForm());
  const isEdit = !!editing;

  // 1) Resolve role: prefer server /api/auth/me, then localStorage fallback
  useEffect(() => {
    (async () => {
      try {
        const headers = authHeaders();
        if ("Authorization" in headers) {
          const res = await fetch(`${API_BASE}/api/auth/me`, { headers: headers as Record<string, string>, cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            const serverRole = normalizeRole(data?.user?.role);
            if (serverRole) {
              setRole(serverRole);
              // keep local cache in sync so it isn’t stale
              localStorage.setItem("user", JSON.stringify({ ...data.user, role: serverRole }));
              setAuthChecked(true);
              return;
            }
          }
        }
        // fallback
        const cached = localStorage.getItem("user");
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedRole = normalizeRole(parsed?.role);
          if (cachedRole) setRole(cachedRole);
        }
      } catch {
        /* ignore */
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // 2) Public: load active packages
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/packages?status=active`, { cache: "no-store" });
        const data = await res.json();
        setActivePackages(data.items || []);
      } catch {
        setGridErr("Failed to load plans.");
      }
    })();
  }, []);

  // 3) Admin: load all packages only for Admin
  const loadAll = async () => {
    setAdminLoading(true);
    setAdminErr("");
    try {
      const res = await fetch(`${API_BASE}/api/packages`, { cache: "no-store" });
      const data = await res.json();
      setAllPackages(data.items || []);
    } catch {
      setAdminErr("Failed to load all packages.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && isAdmin) loadAll();
    else setAllPackages([]);
  }, [authChecked, isAdmin]);

  // 4) Actions
  const handleBuy = async (packageId: string) => {
    const auth = authHeaders();
    if (!("Authorization" in auth)) return alert("Please sign in first.");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if ((auth as any).Authorization) headers.Authorization = (auth as any).Authorization;

    setLoadingId(packageId);
    try {
      const res = await fetch(`${API_BASE}/api/payments/checkout/session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          packageId,
          successUrl: `${window.location.origin}/purchase-success`,
          cancelUrl: `${window.location.origin}/purchase-cancel`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) window.location.href = data.checkoutUrl;
      else alert(data.error || "Could not start checkout");
    } catch {
      alert("Network error starting checkout");
    } finally {
      setLoadingId(null);
    }
  };

  const openCreate = () => {
    if (!isAdmin) return alert("Not authorized.");
    setEditing(null);
    setForm(pkgToForm());
    setOpen(true);
  };
  const openEdit = (p: Pkg) => {
    if (!isAdmin) return alert("Not authorized.");
    setEditing(p);
    setForm(pkgToForm(p));
    setOpen(true);
  };
  const submitForm = async () => {
    if (!isAdmin) return alert("Not authorized.");
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(authHeaders() as any) };
    if (!headers.Authorization) return alert("Admin sign-in required.");

    const priceCents = parsePriceToCents(form.priceDollars);
    if (priceCents == null) return alert("Enter a valid price in dollars (e.g., 19.99)");

    const payload = {
      name: form.name.trim(),
      price: priceCents,
      currency: form.currency,
      type: form.type,
      status: form.status,
      features: form.featuresText.split("\n").map(s => s.trim()).filter(Boolean),
    };

    try {
      let res: Response;
      if (isEdit && editing) {
        res = await fetch(`${API_BASE}/api/packages/${editing._id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`${API_BASE}/api/packages`, { method: "POST", headers, body: JSON.stringify(payload) });
      }
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || 403) alert("Not authorized. Admin role required.");
        else alert(data.error || "Failed to save package");
        return;
      }
      setOpen(false);
      await Promise.all([loadAll(), refreshActive()]);
    } catch {
      alert("Network error saving package");
    }
  };
  const handleDelete = async (p: Pkg) => {
    if (!isAdmin) return alert("Not authorized.");
    if (!confirm(`Soft delete "${p.name}"?`)) return;
    const headers: Record<string, string> = { ...(authHeaders() as any) };
    if (!headers.Authorization) return alert("Admin sign-in required.");
    try {
      const res = await fetch(`${API_BASE}/api/packages/${p._id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || 403) alert("Not authorized. Admin role required.");
        else alert(data.error || "Failed to delete package");
        return;
      }
      await Promise.all([loadAll(), refreshActive()]);
    } catch {
      alert("Network error deleting package");
    }
  };
  const refreshActive = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/packages?status=active`, { cache: "no-store" });
      const data = await res.json();
      setActivePackages(data.items || []);
    } catch {}
  };

  const counts = useMemo(() => {
    const total = allPackages.length;
    const active = allPackages.filter(p => p.status === "active").length;
    return { total, active, inactive: total - active };
  }, [allPackages]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false}/>
          <main className="flex-1 p-8 space-y-10">
            {/* Public Plans */}
            <section>
              <h1 className="text-3xl font-bold text-foreground mb-8">Plans</h1>
              {gridErr && <p className="text-red-500 mb-4">{gridErr}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activePackages.map((plan, index) => (
                  <Card key={plan._id} className={index === 1 ? "border-primary" : ""}>
                    <CardHeader><CardTitle>{plan.name}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-4">{money(plan.price, plan.currency)}</p>
                      <Button className="w-full" onClick={() => handleBuy(plan._id)} disabled={loadingId === plan._id}>
                        {loadingId === plan._id ? "Purchasing…" : "Choose Plan"}
                      </Button>
                      {!!plan.features?.length && (
                        <ul className="space-y-2 mb-4 mt-6">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Admin CRUD — only when server-confirmed Admin */}
            {authChecked && isAdmin && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Admin · Manage Packages</h2>
                  <div className="text-sm text-muted-foreground">
                    Total: {counts.total} · Active: {counts.active} · Inactive: {counts.inactive}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Package</Button>
                  <Button variant="outline" onClick={loadAll} disabled={adminLoading}>Refresh</Button>
                </div>

                {adminErr && <p className="text-red-500">{adminErr}</p>}

                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Updated</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPackages.length === 0 && (
                        <tr><td className="p-3" colSpan={6}>No packages found.</td></tr>
                      )}
                      {allPackages.map((p) => (
                        <tr key={p._id} className="border-t">
                          <td className="p-3">{p.name}</td>
                          <td className="p-3">{money(p.price, p.currency)}</td>
                          <td className="p-3">{p.type}</td>
                          <td className="p-3 capitalize">{p.status}</td>
                          <td className="p-3">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(p)}>
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Add/Edit Modal (Admin only) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{isEdit ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Gold Pack" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.priceDollars}
                       onChange={(e) => setForm(s => ({ ...s, priceDollars: e.target.value }))} placeholder="19.99" />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm(s => ({ ...s, currency: v }))}>
                  <SelectTrigger><SelectValue placeholder="usd" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: "one-time" | "subscription") => setForm(s => ({ ...s, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="one-time" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: "active" | "inactive") => setForm(s => ({ ...s, status: v }))}>
                  <SelectTrigger><SelectValue placeholder="active" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" rows={5} value={form.featuresText}
                        onChange={(e) => setForm(s => ({ ...s, featuresText: e.target.value }))} placeholder={"10 projects\nPriority support\nCustom templates"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitForm} disabled={!isAdmin}>{isEdit ? "Save Changes" : "Create Package"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
