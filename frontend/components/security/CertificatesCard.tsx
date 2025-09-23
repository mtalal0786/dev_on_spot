"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

type CertificateRow = {
  id: string;
  domain: string;
  issuer: string;
  expires: string;
  status: "Valid" | "Expiring" | "Expired";
};

interface CertificatesCardProps {
  setViewAllOpen: (open: boolean) => void;
  setViewAllTitle: (title: string) => void;
  setViewAllDataset: (dataset: "firewalls" | "certs" | "alerts") => void;
  setViewAllRows: (rows: any[]) => void;
  setViewAllCols: (cols: { key: string; label: string; className?: string }[]) => void;
}

export default function CertificatesCard({
  setViewAllOpen,
  setViewAllTitle,
  setViewAllDataset,
  setViewAllRows,
  setViewAllCols,
}: CertificatesCardProps) {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);

  const getAuthToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const fetchCertificates = async () => {
    const token = getAuthToken();
    if (!token) return console.error("No auth token found");

    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${API_BASE}/security/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return console.error("Failed to fetch certificates", res.statusText);

    const data = await res.json();
    setCertificates(data.rows);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const totalCertificates = certificates.length;
  const expiringCount = certificates.filter(c => c.status === "Expiring").length;

  const openCertsModal = () => {
    setViewAllDataset("certs");
    setViewAllTitle("All Certificates");
    setViewAllRows(certificates.map(c => ({
      domain: c.domain,
      issuer: c.issuer,
      expires: c.expires,
      status: c.status,
    })));
    setViewAllCols([
      { key: "domain", label: "Domain" },
      { key: "issuer", label: "Issuer" },
      { key: "expires", label: "Expires", className: "font-mono" },
      { key: "status", label: "Status" },
    ]);
    setViewAllOpen(true);
  };

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          SSL/TLS Certificates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-foreground">{totalCertificates}</div>
            <div className="text-sm text-muted-foreground">Total Certificates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{expiringCount}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon (30d)</div>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {certificates.slice(0, 5).map(cert => (
            <div key={cert.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{cert.domain}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{cert.expires}</span>
                <Badge
                  variant={cert.status === "Valid" ? "default" : cert.status === "Expiring" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {cert.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <Button variant="link" size="sm" className="p-0" onClick={openCertsModal}>
          View All Certificates
        </Button>
      </CardContent>
    </Card>
  );
}
