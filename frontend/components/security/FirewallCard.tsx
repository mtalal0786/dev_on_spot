import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

// Type for firewall rows returned by the API
type FirewallRow = {
  id: string;
  name: string;
  vpc: string;
  region: string;
  status: "Active" | "Disabled";
  rules: number;
  openPorts: number;
  blocked24h: number;
  createdAt: string;
};

interface FirewallCardProps {
  setViewAllOpen: (open: boolean) => void;
  setViewAllTitle: (title: string) => void;
  setViewAllDataset: (dataset: "firewalls" | "certs" | "alerts") => void;
  setViewAllRows: (rows: any[]) => void;
  setViewAllCols: (cols: { key: string; label: string; className?: string }[]) => void;
}

export default function FirewallCard({
  setViewAllOpen,
  setViewAllTitle,
  setViewAllDataset,
  setViewAllRows,
  setViewAllCols,
}: FirewallCardProps) {
  const [firewalls, setFirewalls] = useState<FirewallRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [totalOpenPorts, setTotalOpenPorts] = useState(0);

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  // Fetch firewall data from backend API
  const fetchFirewalls = async () => {
    const token = getAuthToken();
    if (!token) return console.error("No auth token found");
    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${API_BASE}/security/firewalls`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return console.error("Failed to fetch firewalls", res.statusText);

    const data = await res.json();
    setFirewalls(data.rows);

    // Calculate card stats
    const active = data.rows.filter((f: FirewallRow) => f.status === "Active").length;
    const blocked = data.rows.reduce((acc: number, f: FirewallRow) => acc + f.blocked24h, 0);
    const openPorts = data.rows.reduce((acc: number, f: FirewallRow) => acc + f.openPorts, 0);

    setActiveCount(active);
    setTotalBlocked(blocked);
    setTotalOpenPorts(openPorts);
  };

  useEffect(() => {
    fetchFirewalls();
  }, []);

  // Open "View All Firewalls" modal
  const openFirewallsModal = () => {
    setViewAllDataset("firewalls");
    setViewAllTitle("All Firewalls");
    setViewAllRows(
      firewalls.map((f) => ({
        name: f.name,
        openPorts: f.openPorts,
        blocked24h: f.blocked24h,
        status: f.status,
      }))
    );
    setViewAllCols([
      { key: "name", label: "Name" },
      { key: "openPorts", label: "Open Ports", className: "font-mono" },
      { key: "blocked24h", label: "Blocked (24h)", className: "font-mono" },
      { key: "status", label: "Status" },
    ]);
    setViewAllOpen(true);
  };

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Firewall & Network ACLs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-400">{activeCount}</div>
            <div className="text-sm text-muted-foreground">Active Firewalls</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{totalBlocked.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Blocked Threats (24h)</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Open Ports (Critical)</span>
          <Badge variant="destructive">{totalOpenPorts}</Badge>
        </div>

        <div className="flex justify-between">
          <Button variant="link" size="sm" className="p-0" onClick={openFirewallsModal}>
            View All Firewalls
          </Button>
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
