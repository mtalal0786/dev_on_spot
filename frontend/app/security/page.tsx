"use client";

import { useState, useEffect } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Lock,
  AlertTriangle,
  Activity,
  Search,
  Play,
  Pause,
  RefreshCw,
  Ban,
  CheckCircle,
  Globe,
  Settings,
  Zap,
  Mail,
  Bell, // ⬅️ NEW
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

// ⬇️ NEW: import the reusable modal
import { ViewAllModal } from "@/components/security/ViewAllModal";
import FirewallCard from "@/components/security/FirewallCard";
import CertificatesCard from "@/components/security/CertificatesCard";
import AlertsCard from "@/components/security/AlertsCard";
import LoginAttemptsCard from "@/components/security/LoginAttemptsCard";
import MalwareCard from "@/components/security/MalwareCard";
import SecurityPostureCard from "@/components/security/SecurityPostureCard";
import SecurityRulesCard from "@/components/security/SecurityRulesCard";
import SecurityScanCard from "@/components/security/SecurityScanCard";
import LiveTrafficCard from "@/components/security/LiveTrafficCard";

// ⬇️ NEW: toast hook
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockData = {
  securityScore: 92,
  status: "GOOD" as "GOOD" | "WARNING" | "CRITICAL",
  lastUpdated: "2025-09-08 10:30 AM",
  certificates: [
    { name: "api.devonspot.com", expiration: "2025-10-15", status: "Valid" },
    { name: "app.devonspot.com", expiration: "2025-09-20", status: "Expiring" },
    { name: "cdn.devonspot.com", expiration: "2025-08-01", status: "Expired" },
  ],
  alerts: [
    {
      severity: "CRITICAL",
      message: "Unauthorized Access Attempt",
      detail: "IP: 192.168.10.100",
      time: "2 hours ago",
    },
    {
      severity: "HIGH",
      message: "Brute Force Attack Detected",
      detail: "Service: SSH",
      time: "4 hours ago",
    },
    {
      severity: "MEDIUM",
      message: "High Volume of Failed Logins",
      detail: "User: admin",
      time: "6 hours ago",
    },
  ],
  securityRules: {
    total: 50,
    deny: 20,
    recentlyModified: 2,
  },
  loginAttempts: [
    {
      time: "10:30 AM",
      user: "admin",
      ip: "192.168.1.100",
      method: "Password",
      result: "Success",
      reason: "",
    },
    {
      time: "10:25 AM",
      user: "user1",
      ip: "10.0.0.50",
      method: "2FA",
      result: "Success",
      reason: "",
    },
    {
      time: "10:20 AM",
      user: "hacker",
      ip: "203.0.113.1",
      method: "Password",
      result: "Failed",
      reason: "Invalid credentials",
    },
    {
      time: "10:15 AM",
      user: "admin",
      ip: "192.168.1.101",
      method: "Password",
      result: "Failed",
      reason: "Account locked",
    },
  ],
  malware: [
    {
      severity: "HIGH",
      signature: "PHP.WebShell.Generic",
      path: "/uploads/shell.php",
      status: "Quarantined",
    },
    {
      severity: "MEDIUM",
      signature: "JS.Trojan.Downloader",
      path: "/assets/malicious.js",
      status: "Active",
    },
    {
      severity: "LOW",
      signature: "Suspicious.File.Pattern",
      path: "/temp/unknown.exe",
      status: "Resolved",
    },
  ],
};

export default function SecurityPage() {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [liveTraffic, setLiveTraffic] = useState<any[]>([]);
  const [trafficPaused, setTrafficPaused] = useState(false);
  const [trafficFilter, setTrafficFilter] = useState("All");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [savingEmailAlerts, setSavingEmailAlerts] = useState(false);

  // ⬇️ NEW: state for the shared “View All” modal
  // Shared "View All" modal
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [viewAllTitle, setViewAllTitle] = useState("View All");
  const [viewAllDataset, setViewAllDataset] = useState<
    "firewalls" | "certs" | "alerts" | "loginAttempts" | "malware" | "securityPlans"
  >("firewalls");
  const [viewAllRows, setViewAllRows] = useState<any[]>([]);
  const [viewAllCols, setViewAllCols] = useState<
    { key: string; label: string; className?: string }[]
  >([]);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  // ⬇️ NEW: toast
  const { toast } = useToast();

  // ⬇️ NEW: helper to fire a test notification toast
  function triggerTestToast() {
    toast({
      title: "New Critical Alert",
      description: "Unauthorized access attempt detected (test)",
      variant: "destructive",
    });
  }

  // ⬇️ NEW: optional URL switch (?testToast=1) to auto-fire on page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("testToast") === "1") {
      toast({
        title: "New Critical Alert",
        description: "This is a test toast fired from ?testToast=1",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ⬇️ NEW: handle email alerts toggle
  useEffect(() => {
    async function fetchEmailAlerts() {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No auth token found");
        const res = await fetch(`${API_BASE}/security/email-alerts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch email alerts");
        const data = await res.json();
        setEmailAlerts(data.enabled);
      } catch (err) {
        console.error("Failed to fetch email alerts:", err);
      }
    }
    fetchEmailAlerts();
  }, [API_BASE]);  
 
  async function handleToggleEmailAlerts(checked: boolean) {
    setEmailAlerts(checked);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");
      setSavingEmailAlerts(true);
      // Call your backend to persist the preference for the logged-in user
      await fetch(`${API_BASE}/security/email-alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
        body: JSON.stringify({ enabled: checked }),
      });
    } catch (err) {
      console.error("Failed to update email alerts:", err);
      // Optional: revert UI if the save fails
      setEmailAlerts((prev) => !prev);
    } finally {
      setSavingEmailAlerts(false);
    }
  }

  // // Simulate security scan
  // const runScan = () => {
  //   setIsScanning(true);
  //   setScanProgress(0);
  //   const interval = setInterval(() => {
  //     setScanProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         setIsScanning(false);
  //         return 100;
  //       }
  //       return prev + Math.random() * 15;
  //     });
  //   }, 500);
  // };

  // Simulate live traffic
  useEffect(() => {
    if (!trafficPaused) {
      const interval = setInterval(() => {
        const newTraffic = {
          id: Date.now(),
          method: Math.random() > 0.7 ? "POST" : "GET",
          path: [
            "/api/login",
            "/dashboard",
            "/wp-admin",
            "/api/data",
            "/uploads",
          ][Math.floor(Math.random() * 5)],
          status: Math.random() > 0.8 ? "BLOCK" : "ALLOW",
          statusCode: Math.random() > 0.8 ? 403 : 200,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(
            Math.random() * 255
          )}.${Math.floor(Math.random() * 255)}.${Math.floor(
            Math.random() * 255
          )}`,
          country: ["US", "UK", "DE", "FR", "JP", "CN", "RU"][
            Math.floor(Math.random() * 7)
          ],
          rule: Math.random() > 0.8 ? "Brute Force Protection" : null,
          timestamp: new Date().toLocaleTimeString(),
        };
        setLiveTraffic((prev) => [newTraffic, ...prev.slice(0, 19)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [trafficPaused]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GOOD":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "WARNING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredTraffic = liveTraffic.filter(
    (item) =>
      trafficFilter === "All" ||
      (trafficFilter === "Blocked" && item.status === "BLOCK") ||
      (trafficFilter === "Allowed" && item.status === "ALLOW")
  );

  // ⬇️ NEW: open helpers for each “View All …” button (table data from your mockData)

  function openCertsModal() {
    setViewAllDataset("certs");
    setViewAllTitle("All Certificates");
    setViewAllRows(
      mockData.certificates.map((c) => ({
        domain: c.name,
        expires: c.expiration,
        state: c.status,
      }))
    );
    setViewAllCols([
      { key: "domain", label: "Domain" },
      { key: "expires", label: "Expires", className: "font-mono" },
      { key: "state", label: "State" },
    ]);
    setViewAllOpen(true);
  }

  function openAlertsModal() {
    setViewAllDataset("alerts");
    setViewAllTitle("All Alerts (72h)");
    setViewAllRows(
      mockData.alerts.map((a) => ({
        severity: a.severity,
        title: a.message,
        detail: a.detail,
        when: a.time,
      }))
    );
    setViewAllCols([
      { key: "severity", label: "Severity" },
      { key: "title", label: "Alert" },
      { key: "detail", label: "Detail" },
      { key: "when", label: "When" },
    ]);
    setViewAllOpen(true);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Security Overview
                </h1>

                <div className="flex items-center gap-4">
                  {/* Email alerts toggle (new) */}
                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2">
                    <Mail
                      className="w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Label
                      htmlFor="email-alerts"
                      className="text-sm text-muted-foreground"
                    >
                      Email alerts
                    </Label>
                    <Switch
                      id="email-alerts"
                      checked={emailAlerts}
                      onCheckedChange={handleToggleEmailAlerts}
                      disabled={savingEmailAlerts}
                      className="ml-1"
                    />
                  </div>

                  {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search security events..."
                        className="pl-10 w-64"
                        value={trafficFilter === "All" ? "" : trafficFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrafficFilter(val ? val : "All");
                          // Broadcast search to all cards via a custom event
                          window.dispatchEvent(
                            new CustomEvent("security-global-search", { detail: val })
                          );
                        }}
                      />
                    </div>

                  {/* Refresh */}
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={savingEmailAlerts}
                    onClick={() => window.location.reload()}
                    >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                    </Button>

                  {/* ⬇️ NEW: Test Notification button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerTestToast}
                    title="Fire a test notification toast"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* Overall Security Posture */}
                <SecurityPostureCard />

                {/* Firewall & Network ACLs */}
                <FirewallCard
                  setViewAllOpen={setViewAllOpen}
                  setViewAllTitle={setViewAllTitle}
                  setViewAllDataset={setViewAllDataset}
                  setViewAllRows={setViewAllRows}
                  setViewAllCols={setViewAllCols}
                />

                {/* SSL/TLS Certificates */}
                <CertificatesCard
                  setViewAllOpen={setViewAllOpen}
                  setViewAllTitle={setViewAllTitle}
                  setViewAllDataset={setViewAllDataset}
                  setViewAllRows={setViewAllRows}
                  setViewAllCols={setViewAllCols}
                />

                {/* Recent Critical Alerts */}
                <AlertsCard
                  setViewAllOpen={setViewAllOpen}
                  setViewAllTitle={setViewAllTitle}
                  setViewAllDataset={setViewAllDataset}
                  setViewAllRows={setViewAllRows}
                  setViewAllCols={setViewAllCols}
                />

                  {/* Malware Detections */}
                  <MalwareCard
                    setViewAllOpen={setViewAllOpen}
                    setViewAllTitle={setViewAllTitle}
                    setViewAllDataset={setViewAllDataset}
                    setViewAllRows={setViewAllRows}
                    setViewAllCols={setViewAllCols}
                  />
                {/* Security Scan */}
                <SecurityScanCard />

                {/* Custom Security Rules */}
                <SecurityRulesCard
                  setViewAllOpen={setViewAllOpen}
                  setViewAllTitle={setViewAllTitle}
                  setViewAllDataset={setViewAllDataset}
                  setViewAllRows={setViewAllRows}
                  setViewAllCols={setViewAllCols}
                />


                {/* Recent Login Attempts */}
                <LoginAttemptsCard
                  setViewAllOpen={setViewAllOpen}
                  setViewAllTitle={setViewAllTitle}
                  setViewAllDataset={setViewAllDataset}
                  setViewAllRows={setViewAllRows}
                  setViewAllCols={setViewAllCols}
                />


                {/* Live Traffic Monitor */}
                <LiveTrafficCard />
              </div>

              {/* ⬇️ NEW: one shared “View All” modal for Firewalls / Certificates / Alerts */}
              <ViewAllModal
                open={viewAllOpen}
                onOpenChange={setViewAllOpen}
                title={viewAllTitle}
                dataset={viewAllDataset}
                rows={viewAllRows}
                columns={viewAllCols}
                onOpenFullPage={() => {
                  setViewAllOpen(false);
                  if (viewAllDataset === "firewalls")
                    window.location.href = "/security/firewalls";
                  if (viewAllDataset === "certs")
                    window.location.href = "/security/certificates";
                  if (viewAllDataset === "alerts")
                    window.location.href = "/security/alerts";
                  if (viewAllDataset === "loginAttempts")
                    window.location.href = "/security/login-attempts";
                  if (viewAllDataset === "securityPlans") 
                    window.location.href = "/security/plans";
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
