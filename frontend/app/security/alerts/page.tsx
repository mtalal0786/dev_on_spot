"use client";

import { useEffect, useState, useMemo } from "react";
import { TopNav } from "../../../components/top-nav";
import { Sidebar } from "../../../components/sidebar";
import { ThemeProvider } from "../../../components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertTriangle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Download,
  ChevronLeft,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type AlertRow = {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  message: string;
  detail: string;
  source: string;
  time: string; // ISO
  status: "Open" | "Acknowledged" | "Resolved";
};

const SEVERITY_TO_BADGE = (s: AlertRow["severity"]) =>
  s === "CRITICAL"
    ? "bg-red-500 text-white"
    : s === "HIGH"
    ? "bg-orange-500 text-white"
    : s === "MEDIUM"
    ? "bg-yellow-500 text-black"
    : "bg-blue-500 text-white";

const SEVERITY_TO_VARIANT = (s: AlertRow["severity"]) =>
  s === "CRITICAL" || s === "HIGH" ? "destructive" : "default";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    severity: "CRITICAL",
    message: "",
    detail: "",
    source: "WAF",
    status: "Open",
  });
  const { toast } = useToast();

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return console.error("No auth token found");

      const url = `${API_BASE}/security/alerts?q=${encodeURIComponent(
        q
      )}&severity=${severity}&status=${status}&source=${source}&page=${page}&pageSize=${pageSize}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch alerts:", res.statusText);
        return;
      }

      const data = await res.json();
      setAlerts(data.rows);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [q, severity, status, source, page]);

  const createAlert = async () => {
    try {
      const token = getAuthToken();
      if (!token) return console.error("No auth token found");

      const res = await fetch(`${API_BASE}/security/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAlert),
      });

      if (!res.ok) throw new Error("Failed to create alert");

      const createdAlert = await res.json();
      console.log("Created Alert Response:", createdAlert); // Debug log to check response

      // Refresh alerts after creation
      fetchAlerts();

      // Show dynamic toast with new alert data, handling undefined fields
      const alertSeverity = createdAlert.severity || newAlert.severity || "UNKNOWN";
      const alertMessage = createdAlert.message || newAlert.message || "No message";
      const alertDetail = createdAlert.detail || newAlert.detail || "No details provided";

      toast({
        title: `${alertSeverity} Alert: ${alertMessage}`,
        description: alertDetail,
        variant: SEVERITY_TO_VARIANT(alertSeverity as AlertRow["severity"]),
      });

      setAddModalOpen(false);
      setNewAlert({
        severity: "CRITICAL",
        message: "",
        detail: "",
        source: "WAF",
        status: "Open",
      });
    } catch (err) {
      console.error("Error creating alert:", err);
    }
  };

  // Filtered and paginated
  const filtered = useMemo(() => {
    let rows = [...alerts];
    rows.sort((a, b) => (a.time < b.time ? 1 : -1));
    return rows;
  }, [alerts]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setQ("");
    setSeverity("all");
    setStatus("all");
    setSource("all");
    setPage(1);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => history.back()}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <h1 className="text-3xl font-bold">Alerts</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* <Button variant="outline" size="sm" onClick={fetchAlerts}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button> */}
                  <Button variant="outline" size="sm" className="bg-white text-black" onClick={() => setAddModalOpen(true)}>
                    Add Alert
                  </Button>
                  {/* <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button> */}
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
                  {/* Search */}
                  <div className="md:col-span-5">
                    <Label className="mb-1 block text-xs text-muted-foreground">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by message, detail, or ID…"
                        className="h-10 pl-10 pr-8"
                        value={q}
                        onChange={(e) => {
                          setQ(e.target.value);
                          setPage(1);
                        }}
                      />
                      {q && (
                        <button
                          type="button"
                          onClick={() => {
                            setQ("");
                            setPage(1);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="md:col-span-3">
                    <Label className="mb-1 block text-xs text-muted-foreground">Severity</Label>
                    <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="All severities" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="LOW">LOW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Status</Label>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Source</Label>
                    <Select value={source} onValueChange={(v) => { setSource(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="All sources" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="WAF">WAF</SelectItem>
                        <SelectItem value="IDS">IDS</SelectItem>
                        <SelectItem value="Auth">Auth</SelectItem>
                        <SelectItem value="CDN">CDN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <div className="md:col-span-12 flex justify-end pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQ("");
                        setSeverity("all");
                        setStatus("all");
                        setSource("all");
                        setPage(1);
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> All Alerts
                    <span className="text-sm text-muted-foreground font-normal">({total})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Detail</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Badge className={`${SEVERITY_TO_BADGE(r.severity)} text-xs`}>
                              {r.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{r.message}</TableCell>
                          <TableCell className="text-muted-foreground">{r.detail}</TableCell>
                          <TableCell>{r.source}</TableCell>
                          <TableCell className="font-mono text-xs">{new Date(r.time).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "Open" ? "destructive" : r.status === "Acknowledged" ? "secondary" : "default"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {alerts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                            No alerts match your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>

                {/* Pagination */}
                <div className="py-3 px-4">
                  <Pagination>
                    <PaginationContent className="ml-auto">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                        />
                      </PaginationItem>
                      <div className="text-sm px-2 py-1 rounded border">
                        Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
                      </div>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1)); }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </Card>

              {/* Add Alert Modal */}
              <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Alert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Severity</Label>
                      <Select value={newAlert.severity} onValueChange={(v) => setNewAlert((prev) => ({ ...prev, severity: v as any }))}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                          <SelectItem value="HIGH">HIGH</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="LOW">LOW</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Input value={newAlert.message} onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Detail</Label>
                      <Input value={newAlert.detail} onChange={(e) => setNewAlert((prev) => ({ ...prev, detail: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Source</Label>
                      <Select value={newAlert.source} onValueChange={(v) => setNewAlert((prev) => ({ ...prev, source: v as any }))}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WAF">WAF</SelectItem>
                          <SelectItem value="IDS">IDS</SelectItem>
                          <SelectItem value="Auth">Auth</SelectItem>
                          <SelectItem value="CDN">CDN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={newAlert.status} onValueChange={(v) => setNewAlert((prev) => ({ ...prev, status: v as any }))}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="mt-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={createAlert}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}