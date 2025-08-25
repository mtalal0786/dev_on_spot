"use client";

import { useEffect, useMemo, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { ThemeProvider } from "../../components/theme-provider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

import {
  Globe,
  Link as LinkIcon,
  Shield,
  Check,
  X,
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Search,
} from "lucide-react";

// -----------------------------
// Types
// -----------------------------
type PurchasedPlan = "1 month" | "6 months" | "1 year" | "2 years" | "5 years";

interface DomainModel {
  _id: string;
  user_email: string;
  domain_provider_name: string;
  domain_name: string;
  ssl_purchased: boolean;
  domain_status: string;
  purchased_plan: PurchasedPlan;
  expiration_date: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------
// Config / Helpers
// -----------------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api";

const PLAN_OPTIONS: PurchasedPlan[] = [
  "1 month",
  "6 months",
  "1 year",
  "2 years",
  "5 years",
];
const STATUS_OPTIONS = ["active", "pending", "expired", "suspended"];

function formatDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString();
}

function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

// -----------------------------
// Component
// -----------------------------
export default function DomainsPage() {
  const { toast } = useToast();

  // Data
  const [domains, setDomains] = useState<DomainModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  // Availability checker
  const [domainToCheck, setDomainToCheck] = useState("");
  const [availability, setAvailability] = useState<
    "available" | "unavailable" | null
  >(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);

  // Modal (Add/Edit)
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<DomainModel | null>(null);
  const [form, setForm] = useState<
    Omit<DomainModel, "_id" | "createdAt" | "updatedAt" | "user_email">
  >({
    domain_provider_name: "",
    domain_name: "",
    ssl_purchased: false,
    domain_status: "active",
    purchased_plan: "1 year",
    expiration_date: new Date().toISOString(),
  } as any);

  // Derived stats
  const stats = useMemo(() => {
    const active = domains.filter(
      (d) => d.domain_status?.toLowerCase() === "active"
    ).length;
    const sslActive = domains.filter((d) => d.ssl_purchased).length;
    return {
      total: domains.length,
      custom: domains.length, // adjust later if you separate “custom”
      ssl: sslActive,
      active,
    };
  }, [domains]);

  // -----------------------------
  // API Calls
  // -----------------------------
  const fetchDomains = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await fetch(`${API_BASE}/domains`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load domains");
      setDomains(data as DomainModel[]);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to load domains",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  const handleRefresh = () => fetchDomains(true);

  const createDomain = async () => {
    const res = await fetch(`${API_BASE}/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Create failed");
    return data as DomainModel;
  };

  const updateDomain = async (id: string) => {
    const res = await fetch(`${API_BASE}/domains/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Update failed");
    return data as DomainModel;
  };

  const deleteDomain = async (id: string) => {
    const res = await fetch(`${API_BASE}/domains/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Delete failed");
    return true;
  };

  const checkAvailability = async () => {
    setAvailability(null);
    setAvailError(null);
    setAvailLoading(true);
    try {
      const url = `${API_BASE}/domains/check-availability?name=${encodeURIComponent(
        domainToCheck
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to check availability");
      setAvailability(data?.isAvailable ? "available" : "unavailable");
    } catch (e: any) {
      setAvailError(e?.message || "Unexpected error");
      setAvailability("unavailable");
    } finally {
      setAvailLoading(false);
    }
  };

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    fetchDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Handlers
  // -----------------------------
  const openAdd = () => {
    setEditing(null);
    setForm({
      domain_provider_name: "",
      domain_name: "",
      ssl_purchased: false,
      domain_status: "active",
      purchased_plan: "1 year",
      // expiration_date is calculated in backend based on purchased_plan,
      expiration_date: new Date().toISOString(),
    } as any);
    setOpenModal(true);
  };

  const openEdit = (d: DomainModel) => {
    setEditing(d);
    setForm({
      domain_provider_name: d.domain_provider_name,
      domain_name: d.domain_name,
      ssl_purchased: d.ssl_purchased,
      domain_status: d.domain_status,
      purchased_plan: d.purchased_plan,
      expiration_date: d.expiration_date,
    });
    setOpenModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateDomain(editing._id);
        toast({ title: "Domain updated" });
      } else {
        await createDomain();
        toast({ title: "Domain created" });
      }
      setOpenModal(false);
      fetchDomains(true);
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
    }
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm("Delete this domain?");
    if (!ok) return;
    try {
      await deleteDomain(id);
      toast({ title: "Domain deleted" });
      setDomains((prev) => prev.filter((d) => d._id !== id));
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
    }
  };

  // -----------------------------
  // Column filters (provider + domain)
  // -----------------------------
  const filteredDomains = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return domains.filter((d) => {
      const matchesProvider = d.domain_provider_name.toLowerCase().includes(q);
      const matchesDomain = d.domain_name.toLowerCase().includes(q);
      const matchesStatus = d.domain_status.toLowerCase().includes(q);
      const matchesPlan = d.purchased_plan.toLowerCase().includes(q);
      return matchesProvider || matchesDomain || matchesStatus || matchesPlan;
    });
  }, [domains, searchQuery]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-foreground">Domains</h1>
              <div className="flex items-center gap-2">
                <Button onClick={openAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2" />
                    Total Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="mr-2" />
                    Custom Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.custom}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" />
                    SSL Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stats.ssl} Active</p>
                </CardContent>
              </Card>
            </div>

            {/* Availability Checker */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Check Domain Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <Input
                    type="text"
                    placeholder="Enter full domain (e.g., mybrand.com)"
                    value={domainToCheck}
                    onChange={(e) => setDomainToCheck(e.target.value)}
                  />
                  <Button
                    onClick={checkAvailability}
                    disabled={availLoading || !domainToCheck.trim()}
                  >
                    {availLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>

                {availLoading && (
                  <p className="mt-2 flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking
                    availability...
                  </p>
                )}

                {!availLoading && availability && (
                  <p
                    className={classNames(
                      "mt-2 flex items-center font-medium",
                      availability === "available"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {availability === "available" ? (
                      <Check className="mr-2 h-5 w-5" />
                    ) : (
                      <X className="mr-2 h-5 w-5" />
                    )}
                    Domain is {availability}
                  </p>
                )}

                {availError && (
                  <p className="mt-2 text-red-500">{availError}</p>
                )}
              </CardContent>
            </Card>

            {/* Domains Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Domains</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Bar for the entire table */}
                <div className="mb-4 max-w-72">
                  <Input
                    placeholder="Search domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : filteredDomains.length === 0 ? (
                  <p className="text-muted-foreground">
                    No domains match your search.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>SSL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDomains.map((d) => (
                        <TableRow key={d._id}>
                          <TableCell className="font-medium">
                            {d.domain_provider_name}
                          </TableCell>
                          <TableCell>{d.domain_name}</TableCell>
                          <TableCell>
                            {d.ssl_purchased ? "Yes" : "No"}
                          </TableCell>
                          <TableCell
                            className={classNames(
                              d.domain_status?.toLowerCase() === "active"
                                ? "text-green-600"
                                : d.domain_status?.toLowerCase() === "expired"
                                ? "text-red-600"
                                : "text-foreground"
                            )}
                          >
                            {d.domain_status}
                          </TableCell>
                          <TableCell>{d.purchased_plan}</TableCell>
                          <TableCell>{formatDate(d.createdAt)}</TableCell>
                          <TableCell>{formatDate(d.expiration_date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(d)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(d._id)}
                                title="Delete"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Domain" : "Add Domain"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Domain Provider</Label>
                <Input
                  id="provider"
                  placeholder="Namecheap, GoDaddy, Cloudflare…"
                  value={form.domain_provider_name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      domain_provider_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={form.domain_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, domain_name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <Label htmlFor="ssl">SSL Purchased</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark if SSL is already active
                  </p>
                </div>
                <Switch
                  id="ssl"
                  checked={form.ssl_purchased}
                  onCheckedChange={(val) =>
                    setForm((p) => ({ ...p, ssl_purchased: val }))
                  }
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={form.domain_status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, domain_status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Purchased Plan</Label>
                <Select
                  value={form.purchased_plan}
                  onValueChange={(v: PurchasedPlan) =>
                    setForm((p) => ({ ...p, purchased_plan: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional: notes or meta */}
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" placeholder="Internal notes…" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Update Domain" : "Create Domain"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
