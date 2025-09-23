"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SecurityOverview {
  securityScore: number;
  status: "GOOD" | "WARNING" | "CRITICAL";
  lastUpdated: string;
}

export default function SecurityPostureCard() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  const fetchOverview = async () => {
    try {
      const token = getAuthToken();
      if (!token) return console.error("No auth token found");

      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${API_BASE}/security/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch overview:", res.statusText);
        return;
      }

      const data = await res.json();
      setOverview({
        securityScore: data.securityScore,
        status: data.status,
        lastUpdated: new Date(data.lastUpdated).toLocaleString(),
      });
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const getStatusColor = (status: SecurityOverview["status"]) => {
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

  if (!overview) {
    return (
      <Card className="lg:col-span-12">
        <CardHeader>
          <CardTitle>Overall Security Posture</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-12">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overall Security Posture</span>
          <Badge className={`${getStatusColor(overview.status)} border`}>
            {overview.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-foreground">
              {overview.securityScore}/100
            </div>
            <div className="text-sm text-muted-foreground">
              Last Updated: {overview.lastUpdated}
            </div>
          </div>
          <Progress value={overview.securityScore} className="w-48" />
        </div>
      </CardContent>
    </Card>
  );
}
