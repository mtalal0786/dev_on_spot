// components/security/SecurityRulesCard.tsx (Updated with NaN fix)
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

// Type for security plan rows returned by the API
type SecurityPlanRow = {
  _id: string;
  name: string;
  ruleCount: number; // Total number of rules
  denyRules?: number; // Number of deny rules (optional, default 0)
  recentlyModified?: number; // Number of rules modified in the last 24 hours (optional, default 0)
  status: "Active" | "Inactive";
  createdAt: string;
};

interface SecurityRulesCardProps {
  setViewAllOpen: (open: boolean) => void;
  setViewAllTitle: (title: string) => void;
  setViewAllDataset: (dataset: "firewalls" | "certs" | "alerts" | "securityPlans") => void;
  setViewAllRows: (rows: any[]) => void;
  setViewAllCols: (cols: { key: string; label: string; className?: string }[]) => void;
}

export default function SecurityRulesCard({
  setViewAllOpen,
  setViewAllTitle,
  setViewAllDataset,
  setViewAllRows,
  setViewAllCols,
}: SecurityRulesCardProps) {
  const [securityPlans, setSecurityPlans] = useState<SecurityPlanRow[]>([]);
  const [totalRules, setTotalRules] = useState(0);
  const [totalDenyRules, setTotalDenyRules] = useState(0); // Default to 0
  const [recentlyModified, setRecentlyModified] = useState(0); // Default to 0

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  // Fetch security plans data from backend API
  const fetchSecurityPlans = async () => {
    const token = getAuthToken();
    if (!token) return console.error("No auth token found");
    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${API_BASE}/security/plans`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return console.error("Failed to fetch security plans", res.statusText);

    const data = await res.json();
    setSecurityPlans(data);

    // Calculate card stats with defaults to prevent NaN
    const total = data.reduce((acc: number, plan: SecurityPlanRow) => acc + (plan.ruleCount || 0), 0);
    const deny = data.reduce((acc: number, plan: SecurityPlanRow) => acc + (plan.denyRules || 0), 0);
    const modified = data.reduce((acc: number, plan: SecurityPlanRow) => acc + (plan.recentlyModified || 0), 0);

    setTotalRules(total);
    setTotalDenyRules(deny);
    setRecentlyModified(modified);
  };

  useEffect(() => {
    fetchSecurityPlans();
  }, []);

  // Open "View All Security Plans" modal
  const openSecurityPlansModal = () => {
    setViewAllDataset("securityPlans");
    setViewAllTitle("All Security Plans");
    setViewAllRows(
      securityPlans.map((plan) => ({
        name: plan.name,
        ruleCount: plan.ruleCount || 0, // Default to 0
        denyRules: plan.denyRules || 0, // Default to 0
        recentlyModified: plan.recentlyModified || 0, // Default to 0
        status: plan.status,
      }))
    );
    setViewAllCols([
      { key: "name", label: "Name" },
      { key: "ruleCount", label: "Rules", className: "font-mono" },
      { key: "denyRules", label: "Deny Rules", className: "font-mono" },
      { key: "recentlyModified", label: "Modified (24h)", className: "font-mono" },
      { key: "status", label: "Status" },
    ]);
    setViewAllOpen(true);
  };

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Custom Security Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-foreground">{totalRules}</div>
            <div className="text-sm text-muted-foreground">Total Active Rules</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{totalDenyRules}</div>
            <div className="text-sm text-muted-foreground">Rules with Deny</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Recently Modified (24h)</span>
          <Badge variant="outline">{recentlyModified}</Badge>
        </div>
        <Button className="w-full" onClick={() => { window.location.href = "/security/plans"; }}>
          Manage Security Rules
        </Button>
      </CardContent>
    </Card>
  );
}