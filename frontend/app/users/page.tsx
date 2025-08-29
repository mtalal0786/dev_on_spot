"use client";

import { useEffect, useMemo, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Users, UserPlus, UserCheck, Search, Edit, Trash2, ShieldAlert } from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

type Role = "Admin" | "Editor" | "User";

type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  lastLoginAt?: string | null;
};

type Kpis = { totalUsers: number; newUsersLast30: number; activeUsersLast30: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const AUTH_BASE = `${API_BASE}/auth`;

/** ——— Helpers ——— */
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);
const getAuthHeaders = () => {
  const token = getToken();
  return { Authorization: token ? `Bearer ${token}` : "" };
};
// Parse JWT (for UI-only gating; authorization is enforced by backend)
const parseJwt = (token: string | null): { role?: Role } => {
  if (!token) return {};
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return { role: json.role as Role };
  } catch {
    return {};
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [kpis, setKpis] = useState<Kpis>({ totalUsers: 0, newUsersLast30: 0, activeUsersLast30: 0 });
  const [loading, setLoading] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add modal state
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "User" as Role });

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: Role; password?: string }>({
    name: "", email: "", role: "User",
  });

  // Role-gated UI (non-Admin = read-only)
  const token = getToken();
  const { role: myRole } = parseJwt(token);
  const isAdmin = myRole === "Admin";

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // ---- API calls ----
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/users`, { headers: getAuthHeaders() });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(await res.text());
      const data: User[] = await res.json();
      setUsers(data);
    } catch (e: any) {
      console.error(e);
      alert("Failed to fetch users. Make sure you're logged in with a token that has Admin/Editor access.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKpis = async () => {
    setKpiLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/users/kpis`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setKpis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setKpiLoading(false);
    }
  };

  const createUser = async () => {
    setAdding(true);
    try {
      const res = await fetch(`${AUTH_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) {
        const msg = await safeErr(res);
        throw new Error(msg);
      }
      const data = await res.json();
      setUsers(prev => [data.user, ...prev]);
      setAddOpen(false);
      setAddForm({ name: "", email: "", password: "", role: "User" });
      fetchKpis();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create user");
    } finally {
      setAdding(false);
    }
  };

  const updateUser = async () => {
    if (!editUser) return;
    setSavingEdit(true);
    try {
      const payload: any = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetch(`${AUTH_BASE}/users/${editUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await safeErr(res);
        throw new Error(msg);
      }
      const data = await res.json();

      setUsers(prev => prev.map(u => (u._id === editUser._id ? { ...u, ...data.user } : u)));
      setEditOpen(false);
      setEditUser(null);
      setEditForm({ name: "", email: "", role: "User" });
      fetchKpis();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteUser = async (id: string, name?: string) => {
    if (!confirm(`Delete user${name ? ` "${name}"` : ""}?`)) return;
    try {
      const res = await fetch(`${AUTH_BASE}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeErr(res);
        throw new Error(msg);
      }
      setUsers(prev => prev.filter(u => u._id !== id));
      fetchKpis();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to delete user");
    }
  };

  // ---- Effects ----
  useEffect(() => {
    fetchUsers();
    fetchKpis();
  }, []);

  // ---- UI helpers ----
  const openEditModal = (u: User) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setEditOpen(true);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false}/>
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Users</h1>

            {!isAdmin && (
              <div className="mb-6 flex items-center gap-2 text-sm rounded-md border p-3">
                <ShieldAlert className="h-4 w-4" />
                <span>Read-only mode: only Admins can create, edit, or delete users.</span>
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{kpiLoading ? "…" : kpis.totalUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus />
                    New Users (Last 30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{kpiLoading ? "…" : kpis.newUsersLast30}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck />
                    Active Users (Last 30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{kpiLoading ? "…" : kpis.activeUsersLast30}</p>
                </CardContent>
              </Card>
            </div>

            {/* Management */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-auto" disabled={!isAdmin}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add User</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label htmlFor="add-name">Name</Label>
                        <Input
                          id="add-name"
                          value={addForm.name}
                          onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="add-email">Email</Label>
                        <Input
                          id="add-email"
                          type="email"
                          value={addForm.email}
                          onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="add-pass">Password</Label>
                        <Input
                          id="add-pass"
                          type="password"
                          value={addForm.password}
                          onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select
                          value={addForm.role}
                          onValueChange={(v: Role) => setAddForm({ ...addForm, role: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={createUser} disabled={adding || !isValidAdd(addForm) || !isAdmin}>
                        {adding ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <Search className="text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                      )}

                      {!loading && filteredUsers.length === 0 && (
                        <TableRow><TableCell colSpan={4}>No users</TableCell></TableRow>
                      )}

                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(user)}
                                disabled={!isAdmin}
                                title={!isAdmin ? "Admins only" : "Edit"}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUser(user._id, user.name)}
                                disabled={!isAdmin}
                                title={!isAdmin ? "Admins only" : "Delete"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v: Role) => setEditForm({ ...editForm, role: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-pass">Password (optional)</Label>
              <Input
                id="edit-pass"
                type="password"
                placeholder="Leave blank to keep the same"
                onChange={e => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={updateUser} disabled={savingEdit || !isAdmin}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

/** ——— Small utils ——— */
function isValidAdd(f: { name: string; email: string; password: string }) {
  return !!f.name && !!f.email && !!f.password && f.password.length >= 6;
}

async function safeErr(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
    if (Array.isArray(data?.errors)) return data.errors.map((e: any) => e.msg || e).join(", ");
    return `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
