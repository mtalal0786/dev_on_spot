"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  HardDrive,
  Zap,
  AlertTriangle,
  Activity,
  DollarSign,
  Clock,
  Play,
  Square,
  RotateCcw,
  Pencil,
  Trash2,
  Settings,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Config: backend base URL
const API_BASE =
  (
    process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BASE_URL
  )?.replace(/\/$/, "") + "/infrastructure" ||
  "http://localhost:5000/api/infrastructure";

// ---------------------------------------------------------------------------
// Types

type InstanceStatus = "Running" | "Stopped" | "Pending" | "Terminated";

interface ServerRow {
  id: string;
  name: string;
  type: string;
  status: InstanceStatus;
  region: string;
  profile?: "web" | "db" | "gpu";
  cpu: number;
  ram: number;
  gpu: number;
  disk: number;
  netIn?: number;
  netOut?: number;
  uptime: string;
}

interface InstanceForm {
  id?: string;
  name: string;
  type: string;
  status: InstanceStatus;
  region: string;
  profile?: "web" | "db" | "gpu";
  cpu: number;
  ram: number;
  gpu: number;
  disk: number;
  uptime?: string;
}

type QuotaKey = "gpuHours" | "instanceHours" | "storageGB" | "budgetUSD";
interface QuotaSummary {
  gpuHours: { used: number; allocated: number };
  instanceHours: { used: number; allocated: number };
  storage: { used: number; allocated: number };
  budget: { used: number; allocated: number };
}

interface AlertRow {
  id: string;
  type: string;
  resource: string;
  usage: number;
  threshold: number;
  severity: "low" | "medium" | "high";
}

type MetricsSeries = { time: string; value: number };
interface MetricsPayload {
  cpu: MetricsSeries[];
  ram: MetricsSeries[];
  gpu: MetricsSeries[];
  disk: MetricsSeries[];
  netIn: MetricsSeries[];
  netOut: MetricsSeries[];
}

// ---------------------------------------------------------------------------
// Helpers

function getProgressColor(percentage: number) {
  if (percentage < 70) return "bg-green-500";
  if (percentage < 90) return "bg-amber-500";
  return "bg-red-500";
}

function getStatusColor(status: string) {
  switch (status) {
    case "Running":
      return "bg-green-500";
    case "Stopped":
      return "bg-gray-500";
    case "Pending":
      return "bg-amber-500";
    case "Terminated":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function pctFormatter(value: number) {
  return `${value}%`;
}

// Unified fetch with error toast (console for now)
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("API error", res.status, text);
    throw new Error(text || `API ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Reusable UI

function UsageCard({
  title,
  used,
  allocated,
  unit,
  icon: Icon,
}: {
  title: string;
  used: number;
  allocated: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const percentage = Math.round((used / Math.max(allocated, 1)) * 100);
  const remaining = Math.max(allocated - used, 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {used.toLocaleString()} / {allocated.toLocaleString()} {unit}
        </div>
        <div className="mt-2">
          <Progress value={percentage} className="h-2" />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{percentage}% used</span>
            <span
              className={
                percentage > 90
                  ? "text-red-500"
                  : percentage > 70
                  ? "text-amber-500"
                  : "text-green-500"
              }
            >
              {remaining.toLocaleString()} {unit} remaining
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="w-8 text-xs">{label}</span>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800">
        <div
          className={`h-2 rounded-full ${getProgressColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs">{value}%</span>
    </div>
  );
}

function MonitoringChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Forms & Modals

function InstanceFields({
  form,
  setForm,
}: {
  form: InstanceForm;
  setForm: (f: InstanceForm) => void;
}) {
  const update = (k: keyof InstanceForm, v: any) =>
    setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="web-server-01"
          />
        </div>
        <div>
          <Label>Instance Type</Label>
          <Input
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            placeholder="t3.large"
          />
        </div>
        <div>
          <Label>Region</Label>
          <Input
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            placeholder="us-east-1"
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => update("status", v as InstanceStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Stopped">Stopped</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Profile</Label>
          <Select
            value={form.profile ?? "web"}
            onValueChange={(v) => update("profile", v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">web</SelectItem>
              <SelectItem value="db">db</SelectItem>
              <SelectItem value="gpu">gpu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <Label>CPU %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.cpu}
            onChange={(e) => update("cpu", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>RAM %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.ram}
            onChange={(e) => update("ram", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>GPU %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.gpu}
            onChange={(e) => update("gpu", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Disk %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.disk}
            onChange={(e) => update("disk", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

function AddInstanceModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (payload: InstanceForm) => void;
}) {
  const [form, setForm] = useState<InstanceForm>({
    name: "",
    type: "",
    region: "",
    profile: "web",
    status: "Running",
    cpu: 0,
    ram: 0,
    gpu: 0,
    disk: 0,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Instance</DialogTitle>
        </DialogHeader>
        <InstanceFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(form);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditInstanceModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: InstanceForm | null;
  onSubmit: (payload: InstanceForm) => void;
}) {
  const [form, setForm] = useState<InstanceForm>(
    initial || {
      name: "",
      type: "",
      region: "",
      profile: "web",
      status: "Running",
      cpu: 0,
      ram: 0,
      gpu: 0,
      disk: 0,
    }
  );
  useEffect(() => {
    if (open && initial) setForm(initial);
  }, [open, initial]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Instance</DialogTitle>
        </DialogHeader>
        <InstanceFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(form);
              onOpenChange(false);
            }}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditQuotaModal({
  open,
  onOpenChange,
  initialKey,
  initialUsed,
  initialAllocated,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialKey: QuotaKey;
  initialUsed: number;
  initialAllocated: number;
  onSave: (key: QuotaKey, used: number, allocated: number) => void;
}) {
  const [key, setKey] = useState<QuotaKey>(initialKey);
  const [used, setUsed] = useState(initialUsed);
  const [allocated, setAllocated] = useState(initialAllocated);

  useEffect(() => {
    if (open) {
      setKey(initialKey);
      setUsed(initialUsed);
      setAllocated(initialAllocated);
    }
  }, [open, initialKey, initialUsed, initialAllocated]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Update Quota</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quota Key</Label>
            <Select value={key} onValueChange={(v) => setKey(v as QuotaKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpuHours">gpuHours</SelectItem>
                <SelectItem value="instanceHours">instanceHours</SelectItem>
                <SelectItem value="storageGB">storageGB</SelectItem>
                <SelectItem value="budgetUSD">budgetUSD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Used</Label>
              <Input
                type="number"
                value={used}
                onChange={(e) => setUsed(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Allocated</Label>
              <Input
                type="number"
                value={allocated}
                onChange={(e) => setAllocated(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(key, used, allocated);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page

export default function InfrastructurePage() {
  // tabs & modals
  const [activeTab, setActiveTab] = useState<
    "overview" | "instances" | "monitoring"
  >("overview");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [editing, setEditing] = useState<InstanceForm | null>(null);

  // data
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [quotas, setQuotas] = useState<QuotaSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(false);

  // monitoring
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);

  // --------------------- Loaders
  const loadInstances = async () => {
    const rows = await api<ServerRow[]>("/instances");
    setServers(rows);
    if (!selectedInstanceId) {
      const firstRunning = rows.find((r) => r.status === "Running") || rows[0];
      if (firstRunning) setSelectedInstanceId(firstRunning.id);
    }
  };

  const loadQuotas = async () => {
    const res = await api<QuotaSummary>("/quotas");
    setQuotas(res);
  };

  const loadAlerts = async () => {
    const res = await api<AlertRow[]>("/alerts");
    setAlerts(res);
  };

  const loadMetrics = async (instanceId?: string) => {
    const id = instanceId || selectedInstanceId;
    if (!id) {
      setMetrics(null);
      return;
    }
    const res = await api<MetricsPayload>(`/metrics?instanceId=${id}`);
    setMetrics(res);
  };

  // initial + pollers
  useEffect(() => {
    setLoading(true);
    Promise.all([loadInstances(), loadQuotas(), loadAlerts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Poll alerts every 30s
  useEffect(() => {
    const t = setInterval(loadAlerts, 30_000);
    return () => clearInterval(t);
  }, []);

  // Poll metrics every 30s on Monitoring tab
  useEffect(() => {
    if (activeTab !== "monitoring") return;
    loadMetrics();
    const t = setInterval(() => loadMetrics(), 30_000);
    return () => clearInterval(t);
  }, [activeTab, selectedInstanceId]);

  // --------------------- Instance CRUD handlers

  const handleAdd = async (payload: InstanceForm) => {
    await api<{ id: string }>("/instances", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await loadInstances();
  };

  const handleEdit = async (payload: InstanceForm) => {
    if (!payload.id) return;
    await api(`/instances/${payload.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await loadInstances();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this instance?")) return;
    await api(`/instances/${id}`, { method: "DELETE" });
    await loadInstances();
  };

  const handleAction = async (
    id: string,
    action: "start" | "stop" | "reboot"
  ) => {
    await api(`/instances/${id}/actions`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });

    if (action === "reboot") {
      // Only refresh the rebooted instance in the list
      const updatedInstance = await api<ServerRow>(`/instances/${id}`);
      setServers((prev) =>
        prev.map((inst) => (inst.id === id ? updatedInstance : inst))
      );
    } else {
      // For start/stop, reload full list (optional)
      await loadInstances();
    }
  };

  // --------------------- Quota update
  const [quotaDraft, setQuotaDraft] = useState<{
    key: QuotaKey;
    used: number;
    allocated: number;
  }>({
    key: "gpuHours",
    used: 0,
    allocated: 0,
  });
  const openQuotaEditor = (key: QuotaKey, used: number, allocated: number) => {
    setQuotaDraft({ key, used, allocated });
    setQuotaOpen(true);
  };
  const saveQuota = async (key: QuotaKey, used: number, allocated: number) => {
    await api(`/quotas/${key}`, {
      method: "PUT",
      body: JSON.stringify({ used, allocated }),
    });
    await loadQuotas();
  };

  // Derived display for quotas (fallbacks)
  const qGpu = quotas?.gpuHours || { used: 0, allocated: 0 };
  const qInst = quotas?.instanceHours || { used: 0, allocated: 0 };
  const qStorage = quotas?.storage || { used: 0, allocated: 0 };
  const qBudget = quotas?.budget || { used: 0, allocated: 0 };

  const monitoringOptions = useMemo(
    () => servers.map((s) => ({ id: s.id, name: s.name })),
    [servers]
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="mx-auto max-w-7xl">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">
                  Infrastructure
                </h1>
                <div className="flex gap-2">
                  {/* Only show Add on Instances tab */}
                  {activeTab === "instances" && (
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                      <Server className="mr-2 h-4 w-4" /> Add Instance
                    </Button>
                  )}
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="instances">Instances</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                {/* ---------------- OVERVIEW ---------------- */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Summary cards with inline edit buttons */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                      <UsageCard
                        title="GPU Hours"
                        used={qGpu.used}
                        allocated={qGpu.allocated}
                        unit="hrs"
                        icon={Zap}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-12"
                        onClick={() =>
                          openQuotaEditor("gpuHours", qGpu.used, qGpu.allocated)
                        }
                      >
                        <Pencil className="h-4 w-4 top-12" />
                      </Button>
                    </div>

                    <div className="relative">
                      <UsageCard
                        title="Instance Hours"
                        used={qInst.used}
                        allocated={qInst.allocated}
                        unit="hrs"
                        icon={Clock}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-12"
                        onClick={() =>
                          openQuotaEditor(
                            "instanceHours",
                            qInst.used,
                            qInst.allocated
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 top-12" />
                      </Button>
                    </div>

                    <div className="relative">
                      <UsageCard
                        title="Storage"
                        used={qStorage.used}
                        allocated={qStorage.allocated}
                        unit="GB"
                        icon={HardDrive}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-12"
                        onClick={() =>
                          openQuotaEditor(
                            "storageGB",
                            qStorage.used,
                            qStorage.allocated
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 top-12" />
                      </Button>
                    </div>

                    <div className="relative">
                      <UsageCard
                        title="Budget"
                        used={qBudget.used}
                        allocated={qBudget.allocated}
                        unit="USD"
                        icon={DollarSign}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-12"
                        onClick={() =>
                          openQuotaEditor(
                            "budgetUSD",
                            qBudget.used,
                            qBudget.allocated
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 top-12" />
                      </Button>
                    </div>
                  </div>

                  {/* Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                        Resource Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {alerts.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No active alerts.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {alerts.map((alert) => (
                            <div
                              key={alert.id}
                              className="flex items-center justify-between rounded-lg p-3 bg-amber-50 dark:bg-amber-950"
                            >
                              <div className="flex items-center space-x-3">
                                <Badge
                                  variant={
                                    alert.severity === "high"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <span className="font-medium">
                                  {alert.type}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  usage: {alert.usage}% (threshold:{" "}
                                  {alert.threshold}%)
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Instance: {alert.resource}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Server health overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        Server Health Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {servers
                          .filter((s) => s.status === "Running")
                          .map((server) => (
                            <div
                              key={server.id}
                              className="rounded-lg border p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`h-3 w-3 rounded-full ${getStatusColor(
                                      server.status
                                    )}`}
                                  />
                                  <span className="font-medium">
                                    {server.name}
                                  </span>
                                  <Badge variant="outline">{server.type}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {server.region}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  Uptime: {server.uptime}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <HealthBar value={server.cpu} label="CPU" />
                                <HealthBar value={server.ram} label="RAM" />
                                {server.gpu > 0 && (
                                  <HealthBar value={server.gpu} label="GPU" />
                                )}
                                <HealthBar value={server.disk} label="Disk" />
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ---------------- INSTANCES ---------------- */}
                <TabsContent value="instances" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Instances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {servers.map((server) => (
                          <div
                            key={server.id}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-3 w-3 rounded-full ${getStatusColor(
                                  server.status
                                )}`}
                              />
                              <div>
                                <div className="font-medium">{server.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {server.id}
                                </div>
                              </div>
                              <Badge variant="outline">{server.type}</Badge>
                              <Badge
                                variant={
                                  server.status === "Running"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {server.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {server.region}
                              </span>
                            </div>

                            <div className="hidden w-[380px] gap-3 md:flex">
                              <HealthBar value={server.cpu} label="CPU" />
                              <HealthBar value={server.ram} label="RAM" />
                              {server.gpu > 0 && (
                                <HealthBar value={server.gpu} label="GPU" />
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditing({ ...server });
                                  setEditOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(server.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {server.status === "Running" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Stop"
                                    onClick={() =>
                                      handleAction(server.id, "stop")
                                    }
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Reboot"
                                    onClick={() =>
                                      handleAction(server.id, "reboot")
                                    }
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Start"
                                  onClick={() =>
                                    handleAction(server.id, "start")
                                  }
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInstanceId(server.id); // Select the instance in dropdown
                                  setActiveTab("monitoring"); // Switch to monitoring tab
                                }}
                              >
                                Monitor
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modals mounted here keeps them across tabs */}
                  <AddInstanceModal
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    onSubmit={handleAdd}
                  />
                  <EditInstanceModal
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    initial={editing}
                    onSubmit={handleEdit}
                  />
                </TabsContent>

                {/* ---------------- MONITORING ---------------- */}
                <TabsContent value="monitoring" className="space-y-6">
                  {/* Instance selector */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Monitoring</CardTitle>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Instance</Label>
                        <Select
                          value={selectedInstanceId ?? undefined}
                          onValueChange={(v) => {
                            setSelectedInstanceId(v);
                            loadMetrics(v);
                          }}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select instance" />
                          </SelectTrigger>
                          <SelectContent>
                            {monitoringOptions.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.id.slice(-6)} — {opt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Data refreshes automatically every 30s while you’re on
                      this tab.
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <MonitoringChartCard title="CPU Utilization">
                      <AreaChart
                        data={metrics?.cpu || []}
                        margin={{ left: 10, right: 10 }}
                      >
                        <defs>
                          <linearGradient
                            id="cpuFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopOpacity={0.6} />
                            <stop offset="95%" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} opacity={0.2} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tickFormatter={pctFormatter} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "CPU"]} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="currentColor"
                          fill="url(#cpuFill)"
                        />
                      </AreaChart>
                    </MonitoringChartCard>

                    <MonitoringChartCard title="Memory Usage">
                      <LineChart
                        data={metrics?.ram || []}
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid vertical={false} opacity={0.2} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tickFormatter={pctFormatter} />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, "Memory"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </MonitoringChartCard>

                    <MonitoringChartCard title="Network I/O (KB/s)">
                      <LineChart
                        data={(metrics?.netIn || []).map((row, i) => ({
                          time: row.time,
                          in: row.value,
                          out: metrics?.netOut?.[i]?.value ?? 0,
                        }))}
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid vertical={false} opacity={0.2} />
                        <XAxis dataKey="time" hide />
                        <YAxis />
                        <Legend />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="in"
                          name="Inbound"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="out"
                          name="Outbound"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </MonitoringChartCard>

                    <MonitoringChartCard title="Disk I/O (IOPS)">
                      <BarChart
                        data={(metrics?.disk || []).map((row) => ({
                          time: row.time,
                          read: row.value,
                          write: Math.max(0, row.value - 5),
                        }))}
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid vertical={false} opacity={0.2} />
                        <XAxis dataKey="time" hide />
                        <YAxis />
                        <Legend />
                        <Tooltip />
                        <Bar dataKey="read" name="Read" />
                        <Bar dataKey="write" name="Write" />
                      </BarChart>
                    </MonitoringChartCard>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Global Modals mounted once so they work on any tab */}
              <AddInstanceModal
                open={addOpen}
                onOpenChange={setAddOpen}
                onSubmit={handleAdd}
              />
              <EditInstanceModal
                open={editOpen}
                onOpenChange={setEditOpen}
                initial={editing}
                onSubmit={handleEdit}
              />
              <EditQuotaModal
                open={quotaOpen}
                onOpenChange={setQuotaOpen}
                initialKey={quotaDraft.key}
                initialUsed={quotaDraft.used}
                initialAllocated={quotaDraft.allocated}
                onSave={saveQuota}
              />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
