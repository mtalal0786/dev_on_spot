import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, Zap } from "lucide-react";
import axios from "axios";

interface ScanData {
  scanId: string;
  status: "pending" | "in-progress" | "completed";
  progress: number;
  filesScanned: number;
  threatsFound: number;
  vulnerabilities: number;
  severity: string;
  startedAt: string;
  completedAt?: string;
}

export default function SecurityScanCard() {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  const runScan = async () => {
    try {
      setError(null); // Clear previous errors
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");
      const response = await axios.post(`${API_BASE}/security/scan`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScanData(response.data);
      setIsScanning(true);
      pollScanStatus(response.data.scanId);
    } catch (err) {
      console.error("Failed to initiate scan:", err);
      setError("Failed to start scan. Please try again.");
    }
  };

  const pollScanStatus = async (scanId: string) => {
    const interval = setInterval(async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE}/security/scan/${scanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScanData(response.data);
        console.log("Received scan data:", response.data); // Debug log
        if (response.data.status === "completed") {
          setIsScanning(false); // Ensure isScanning is false on completion
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to poll scan status:", err);
        setError("Failed to update scan status.");
        setIsScanning(false); // Stop scanning on error
        clearInterval(interval);
      }
    }, 1000); // Poll every second
  };

  useEffect(() => {
    const lastScanId = localStorage.getItem("lastScanId"); // Optional: Retrieve last scan
    if (lastScanId) {
      pollScanStatus(lastScanId);
    }
  }, []);

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Security Scan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !scanData && !error && (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">Run a comprehensive security scan</div>
            <Button onClick={runScan} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Run Scan
            </Button>
          </div>
        )}
        {isScanning && scanData && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Scanning... {Math.round(scanData.progress)}%
              </div>
              <Progress value={scanData.progress} className="w-full" />
            </div>
            <div className="text-xs text-muted-foreground">
              Checking files, permissions, and vulnerabilities...
            </div>
          </div>
        )}
        {scanData?.status === "completed" && !isScanning && (
          <div className="space-y-3">
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Scan completed successfully
            </div>
            <div className="text-sm">
              <div>Files scanned: {scanData.filesScanned}</div>
              <div>Threats found: {scanData.threatsFound}</div>
              <div>Vulnerabilities: {scanData.vulnerabilities} ({scanData.severity})</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setScanData(null);
              localStorage.removeItem("lastScanId"); // Optional: Clear last scan
            }}>
              Run New Scan
            </Button>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}
      </CardContent>
    </Card>
  );
}