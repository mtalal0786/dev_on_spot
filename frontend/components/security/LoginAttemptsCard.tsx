"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Activity } from "lucide-react";

interface LoginAttempt {
  id: string;
  user: string;
  ip: string;
  method: string;
  result: "Success" | "Failed";
  reason: string;
  time: string; // ISO string
}

interface LoginAttemptsCardProps {
  setViewAllOpen: (open: boolean) => void;
  setViewAllTitle: (title: string) => void;
  setViewAllDataset: (dataset: "firewalls" | "certs" | "alerts" | "loginAttempts") => void;
  setViewAllRows: (rows: any[]) => void;
  setViewAllCols: (cols: { key: string; label: string; className?: string }[]) => void;
}

export default function LoginAttemptsCard({
  setViewAllOpen,
  setViewAllTitle,
  setViewAllDataset,
  setViewAllRows,
  setViewAllCols,
}: LoginAttemptsCardProps) {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [total, setTotal] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  const fetchLoginAttempts = async () => {
    try {
      const token = getAuthToken();
      if (!token) return console.error("No auth token found");

      const res = await fetch(`${API_BASE}/security/login-attempts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch login attempts:", res.statusText);
        return;
      }

      const data = await res.json();
      setLoginAttempts(data.rows);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching login attempts:", err);
    }
  };

  useEffect(() => {
    fetchLoginAttempts();
  }, []);

  // Open "View All Login Attempts" modal
  const openLoginAttemptsModal = () => {
    setViewAllDataset("loginAttempts");
    setViewAllTitle("Recent Login Attempts");
    setViewAllRows(
      loginAttempts.map((a) => ({
        user: a.user,
        ip: a.ip,
        method: a.method,
        result: a.result,
        reason: a.reason,
        time: new Date(a.time).toLocaleString(),
      }))
    );
    setViewAllCols([
      { key: "user", label: "User" },
      { key: "ip", label: "IP" },
      { key: "method", label: "Method" },
      { key: "result", label: "Result" },
      { key: "reason", label: "Reason" },
      { key: "time", label: "Time" },
    ]);
    setViewAllOpen(true);
  };

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Login Attempts
          <span className="text-sm text-muted-foreground font-normal ml-2">
            ({total})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loginAttempts.slice(0, 5).map((attempt) => (
          <div
            key={attempt.id}
            className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{new Date(attempt.time).toLocaleTimeString()}</span>
              <span>{attempt.user}</span>
              <span className="text-muted-foreground">({attempt.ip})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={attempt.result === "Success" ? "default" : "destructive"}
                className="text-xs"
              >
                {attempt.result}
              </Badge>
            </div>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}
