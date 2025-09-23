"use client";

import { useMemo, useState, useEffect } from "react";
import { TopNav } from "../../../components/top-nav";
import { Sidebar } from "../../../components/sidebar";
import { ThemeProvider } from "../../../components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Shield,
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  X,
} from "lucide-react";

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

export default function FirewallsPage() {
  const [firewalls, setFirewalls] = useState<FirewallRow[]>([]);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"name" | "blocked24h" | "openPorts" | "rules">("blocked24h");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token"); // Assuming token is stored as 'authToken'
    }
    return null;
  };

  const handleGetFirewalls = async () => {
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found");
      return;
    }
    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL; // Get the base URL from the environment variable
    const url = `${API_BASE}/security/firewalls?q=${q}&region=${region}&status=${status}&sort=${sort}&page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      // Handle error if the request fails
      console.error("Error fetching firewalls:", response.statusText);
      return;
    }

    const data = await response.json();
    setFirewalls(data.rows); // Assuming the response has a "rows" field with the firewall data
  };

  useEffect(() => {
    handleGetFirewalls();
  }, [q, region, status, sort, page]);

  const filtered = useMemo(() => {
    let rows = [...firewalls];
    rows.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b as any)[sort] - (a as any)[sort];
    });
    return rows;
  }, [q, region, status, sort, firewalls]);

  const totalPages = Math.max(1, Math.ceil(firewalls.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
    setPage(1); // Reset to the first page when search is updated
  };

  // Function to handle reset filters button click
  const resetFilters = () => {
    setQ(""); // Reset search field
    setRegion("all"); // Reset region filter
    setStatus("all"); // Reset status filter
    setSort("blocked24h"); // Reset sort option
    setPage(1); // Reset pagination to the first page
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => history.back()}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <h1 className="text-3xl font-bold">Firewalls</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                    Filters
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4 items-end">
                  {/* Search */}
                  <div className="relative md:col-span-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      aria-label="Search"
                      placeholder="Search by name, ID, or VPC…"
                      className="pl-10 pr-8 h-10"
                      value={q}
                      onChange={handleSearchChange} // Call the handler when search field is changed
                    />
                    {q && (
                      <button
                        type="button"
                        onClick={() => {
                          setQ(""); // Clear search term
                          setPage(1); // Reset pagination to the first page
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Region */}
                  <div className="md:col-span-3">
                    <Label className="mb-1 block text-xs text-muted-foreground">Region</Label>
                    <Select
                      value={region}
                      onValueChange={(v) => {
                        setRegion(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="us-east-1">us-east-1</SelectItem>
                        <SelectItem value="us-west-2">us-west-2</SelectItem>
                        <SelectItem value="eu-central-1">eu-central-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => {
                        setStatus(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">Sort by</Label>
                    <Select
                      value={sort}
                      onValueChange={(v: any) => {
                        setSort(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blocked24h">Blocked (24h)</SelectItem>
                        <SelectItem value="openPorts">Open Ports</SelectItem>
                        <SelectItem value="rules">Rules</SelectItem>
                        <SelectItem value="name">Name (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset button aligned right */}
                  <div className="md:col-span-12 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Reset filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" /> All Firewalls
                    <span className="text-sm text-muted-foreground font-normal">
                      ({firewalls.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>VPC</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead>Open Ports</TableHead>
                        <TableHead>Blocked (24h)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((r, index) => (
                        <TableRow key={r.id || index}>
                          {/* Using `r.id` or index as a fallback */}
                          <TableCell>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.id}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{r.vpc}</TableCell>
                          <TableCell>{r.region}</TableCell>
                          <TableCell className="font-mono">{r.rules}</TableCell>
                          <TableCell className="font-mono">{r.openPorts}</TableCell>
                          <TableCell className="font-mono">{r.blocked24h.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "Active" ? "default" : "secondary"}>
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
                      {visible.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                            No firewalls match your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <div className="py-3 px-4">
                  <Pagination>
                    <PaginationContent className="ml-auto">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                        />
                      </PaginationItem>
                      <div className="text-sm px-2 py-1 rounded border">
                        Page {page} of {totalPages}
                      </div>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(totalPages, p + 1));
                          }}
                        />
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
