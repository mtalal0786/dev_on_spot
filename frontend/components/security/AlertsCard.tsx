"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

type AlertRow = {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  message: string;
  detail: string;
  source: string;
  time: string;
  status: "Open" | "Acknowledged" | "Resolved";
};

interface AlertsCardProps {
  setViewAllOpen: (open: boolean) => void;
  setViewAllTitle: (title: string) => void;
  setViewAllDataset: (dataset: "firewalls" | "certs" | "alerts") => void;
  setViewAllRows: (rows: any[]) => void;
  setViewAllCols: (cols: { key: string; label: string; className?: string }[]) => void;
}

export default function AlertsCard({
  setViewAllOpen,
  setViewAllTitle,
  setViewAllDataset,
  setViewAllRows,
  setViewAllCols,
}: AlertsCardProps) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  const getAuthToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const fetchAlerts = async () => {
    const token = getAuthToken();
    if (!token) return console.error("No auth token found");

    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${API_BASE}/security/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return console.error("Failed to fetch alerts", res.statusText);

    const data = await res.json();
    setAlerts(data.rows);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getSeverityColor = (severity: AlertRow["severity"]) =>
    severity === "CRITICAL"
      ? "bg-red-500 text-white"
      : severity === "HIGH"
      ? "bg-orange-500 text-white"
      : severity === "MEDIUM"
      ? "bg-yellow-500 text-black"
      : "bg-blue-500 text-white";

  const openAlertsModal = () => {
    setViewAllDataset("alerts");
    setViewAllTitle("All Alerts (72h)");
    setViewAllRows(alerts.map(a => ({
      severity: a.severity,
      message: a.message,
      detail: a.detail,
      source: a.source,
      time: a.time,
      status: a.status,
    })));
    setViewAllCols([
      { key: "severity", label: "Severity" },
      { key: "message", label: "Message" },
      { key: "detail", label: "Detail" },
      { key: "source", label: "Source" },
      { key: "time", label: "Time", className: "font-mono" },
      { key: "status", label: "Status" },
    ]);
    setViewAllOpen(true);
  };

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Recent Critical Alerts (72h)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.slice(0, 5).map(alert => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
              {alert.severity}
            </Badge>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{alert.message}</div>
              <div className="text-xs text-muted-foreground">{alert.detail}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(alert.time).toLocaleString()}</div>
            </div>
          </div>
        ))}
        <div className="flex justify-between">
          <Button variant="link" size="sm" className="p-0" onClick={openAlertsModal}>
            View All Alerts
          </Button>
          <Button variant="ghost" size="sm">Dismiss</Button>
        </div>
      </CardContent>
    </Card>
  );
}
