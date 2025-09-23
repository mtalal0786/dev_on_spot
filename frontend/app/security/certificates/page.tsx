"use client";

import { useEffect, useState } from "react";
import { TopNav } from "../../../components/top-nav";
import { Sidebar } from "../../../components/sidebar";
import { ThemeProvider } from "../../../components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Lock, Search, SlidersHorizontal, Download, RefreshCw, Eye, ChevronLeft, X } from "lucide-react";

type CertRow = {
  id: string;
  domain: string;
  issuer: string;
  expires: string; // YYYY-MM-DD
  daysLeft: number;
  status: "Valid" | "Expiring" | "Expired";
};

export default function CertificatesPage() {
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [issuer, setIssuer] = useState("all");
  const [sort, setSort] = useState<"daysLeft" | "domain">("daysLeft");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  const fetchCertificates = async () => {
    try {
      const token = getAuthToken();
      if (!token) return console.error("No auth token found");

      const url = `${API_BASE}/security/certificates?q=${encodeURIComponent(q)}&status=${status}&issuer=${issuer}&sort=${sort}&page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch certificates:", res.statusText);
        return;
      }

      const data = await res.json();
      setCerts(data.rows);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [q, status, issuer, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function resetFilters() {
    setQ("");
    setStatus("all");
    setIssuer("all");
    setSort("daysLeft");
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
                  <h1 className="text-3xl font-bold">Certificates</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* <Button variant="outline" size="sm" onClick={fetchCertificates}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button> */}
                  {/* <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button> */}
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" /> Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-12 md:gap-4 gap-3 items-end">
                  {/* Search */}
                  <div className="relative md:col-span-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      aria-label="Search certificates"
                      placeholder="Search by domain or ID…"
                      className="pl-10 pr-8 h-10"
                      value={q}
                      onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    />
                    {q && (
                      <button
                        type="button"
                        onClick={() => { setQ(""); setPage(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Status</Label>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expiring">Expiring</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Issuer */}
                  <div className="md:col-span-3">
                    <Label className="mb-1 block text-xs text-muted-foreground">Issuer</Label>
                    <Select value={issuer} onValueChange={(v) => { setIssuer(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="All issuers" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Let's Encrypt">Let's Encrypt</SelectItem>
                        <SelectItem value="DigiCert">DigiCert</SelectItem>
                        <SelectItem value="Sectigo">Sectigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Sort by</Label>
                    <Select value={sort} onValueChange={(v: any) => { setSort(v); setPage(1); }}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Choose…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daysLeft">Days Left</SelectItem>
                        <SelectItem value="domain">Domain (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <div className="md:col-span-12 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setQ(""); setStatus("all"); setIssuer("all"); setSort("daysLeft"); setPage(1); }} className="mt-2">
                      Reset filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" /> All Certificates
                    <span className="text-sm text-muted-foreground font-normal">({total})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certs.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{r.domain}</div>
                            <div className="text-xs text-muted-foreground">{r.id}</div>
                          </TableCell>
                          <TableCell>{r.issuer}</TableCell>
                          <TableCell className="font-mono text-sm">{r.expires}</TableCell>
                          <TableCell className="font-mono">{r.daysLeft}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "Valid" ? "default" : r.status === "Expiring" ? "secondary" : "destructive"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {certs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            No certificates match your filters.
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
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                      </PaginationItem>
                      <div className="text-sm px-2 py-1 rounded border">
                        Page {page} of {totalPages}
                      </div>
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
