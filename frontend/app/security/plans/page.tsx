"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TopNav } from "../../../components/top-nav";
import { Sidebar } from "../../../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Search,
  Plus,
  Download,
  Upload,
  Edit,
  Copy,
  Power,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  ArrowRight,
  GripVertical,
  X,
  Info,
} from "lucide-react";
import { ThemeProvider } from "../../../components/theme-provider";

// Base URL for API requests
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Types
type SecurityPlan = {
  _id: string;
  name: string;
  description: string;
  owner: string;
  mode: string;
  targets: string[];
  createdAt: string;
  updatedAt: string;
  ruleCount: number; // Updated from rules
};

type InRule = {
  _id: string;
  planId: string;
  type: string;
  protocol: string;
  portRange: string;
  source: string;
  description?: string;
  status: string;
  priority: number;
};

type OutRule = {
  _id: string;
  planId: string;
  type: string;
  protocol: string;
  portRange: string;
  destination: string;
  description?: string;
  status: string;
  priority: number;
};

// Type guard for InRule
function isInRule(rule: InRule | OutRule): rule is InRule {
  return (rule as InRule).source !== undefined;
}

// Type guard for OutRule
function isOutRule(rule: InRule | OutRule): rule is OutRule {
  return (rule as OutRule).destination !== undefined;
}

// Inbound Rules Section
function InboundRulesSection(props: {
  rules: InRule[];
  planId?: string;
  onAdd?: (
    rule: Omit<InRule, "_id" | "planId" | "status" | "priority">
  ) => void;
  onDelete?: (id: string) => void;
  onEdit?: (rule: InRule) => void;
}) {
  const [newRule, setNewRule] = useState<
    Omit<InRule, "_id" | "planId" | "status" | "priority">
  >({
    type: "Custom TCP",
    protocol: "TCP",
    portRange: "",
    source: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const readOnly = !props.onAdd || !props.onDelete;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {props.rules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No inbound rules</h3>
            <p className="text-muted-foreground mb-4">
              This security plan has no inbound rules. Add rules to allow
              specific inbound traffic.
            </p>
            {!readOnly && (
              <Button
                onClick={() => {
                  if (!newRule.portRange || !newRule.source) {
                    setError("Port range and source are required");
                    return;
                  }
                  setError(null);
                  props.onAdd?.(newRule);
                  setNewRule({
                    type: "Custom TCP",
                    protocol: "TCP",
                    portRange: "",
                    source: "",
                    description: "",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    Protocol{" "}
                    <Info className="w-3 h-3 inline text-muted-foreground" />
                  </TableHead>
                  <TableHead>
                    Port range{" "}
                    <Info className="w-3 h-3 inline text-muted-foreground" />
                  </TableHead>
                  <TableHead>
                    Source{" "}
                    <Info className="w-3 h-3 inline text-muted-foreground" />
                  </TableHead>
                  <TableHead>
                    Description - optional{" "}
                    <Info className="w-3 h-3 inline text-muted-foreground" />
                  </TableHead>
                  {readOnly ? <TableHead /> : <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.rules.map((rule) => (
                  <TableRow key={rule._id}>
                    <TableCell>
                      <Badge variant="outline">{rule.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.protocol}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.portRange}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {rule.source}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {rule.description || "-"}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          {props.onEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => props.onEdit?.(rule)}
                              className="text-green-400 border-green-400 hover:bg-green-400/10"
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => props.onDelete?.(rule._id)}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Inbound Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newRule.type}
                  onValueChange={(v) => setNewRule((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                    <SelectItem value="SSH">SSH</SelectItem>
                    <SelectItem value="RDP">RDP</SelectItem>
                    <SelectItem value="MySQL/Aurora">MySQL/Aurora</SelectItem>
                    <SelectItem value="Custom TCP">Custom TCP</SelectItem>
                    <SelectItem value="All Traffic">All Traffic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Protocol</Label>
                <Select
                  value={newRule.protocol}
                  onValueChange={(v) =>
                    setNewRule((p) => ({ ...p, protocol: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="ICMP">ICMP</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Port Range</Label>
                <Input
                  placeholder="80"
                  value={newRule.portRange}
                  onChange={(e) =>
                    setNewRule((p) => ({ ...p, portRange: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Source</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0.0.0.0/0"
                    className="flex-1"
                    value={newRule.source}
                    onChange={(e) =>
                      setNewRule((p) => ({ ...p, source: e.target.value }))
                    }
                  />
                  <Button size="sm" variant="outline">
                    <Search className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Allow HTTP traffic"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (!newRule.portRange || !newRule.source) {
                    setError("Port range and source are required");
                    return;
                  }
                  setError(null);
                  props.onAdd?.(newRule);
                  setNewRule({
                    type: "Custom TCP",
                    protocol: "TCP",
                    portRange: "",
                    source: "",
                    description: "",
                  });
                }}
              >
                Add Rule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setNewRule({
                    type: "Custom TCP",
                    protocol: "TCP",
                    portRange: "",
                    source: "",
                    description: "",
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Outbound Rules Section
function OutboundRulesSection(props: {
  rules: OutRule[];
  planId?: string;
  onAdd?: (
    rule: Omit<OutRule, "_id" | "planId" | "status" | "priority">
  ) => void;
  onDelete?: (id: string) => void;
  onEdit?: (rule: OutRule) => void;
}) {
  const [newRule, setNewRule] = useState<
    Omit<OutRule, "_id" | "planId" | "status" | "priority">
  >({
    type: "All traffic",
    protocol: "All",
    portRange: "All",
    destination: "0.0.0.0/0",
    description: "",
  });
  const [dismissWarn, setDismissWarn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readOnly = !props.onAdd || !props.onDelete;
  const hasOpenAll = props.rules.some(
    (r) => r.destination === "0.0.0.0/0" || r.destination === "::/0"
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>
                  Protocol{" "}
                  <Info className="w-3 h-3 inline text-muted-foreground" />
                </TableHead>
                <TableHead>
                  Port range{" "}
                  <Info className="w-3 h-3 inline text-muted-foreground" />
                </TableHead>
                <TableHead>
                  Destination{" "}
                  <Info className="w-3 h-3 inline text-muted-foreground" />
                </TableHead>
                <TableHead>
                  Description - optional{" "}
                  <Info className="w-3 h-3 inline text-muted-foreground" />
                </TableHead>
                {readOnly ? <TableHead /> : <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.rules.map((rule) => (
                <TableRow key={rule._id}>
                  <TableCell>
                    <Badge variant="outline">{rule.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rule.protocol}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rule.portRange}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          rule.destination === "0.0.0.0/0" ||
                          rule.destination === "::/0"
                            ? "border-amber-500 text-amber-400"
                            : ""
                        }
                      >
                        {rule.destination}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Search className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.description || "-"}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-2">
                        {props.onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => props.onEdit?.(rule)}
                            className="text-green-400 border-green-400 hover:bg-green-400/10"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => props.onDelete?.(rule._id)}
                          className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {hasOpenAll && !dismissWarn && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Rules with destination of 0.0.0.0/0 or ::/0 allow your instances
              to send traffic to any IPv4 or IPv6 address. Prefer restricting to
              known IPs.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-600 dark:text-amber-400"
            onClick={() => setDismissWarn(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Outbound Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newRule.type}
                  onValueChange={(v) => setNewRule((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                    <SelectItem value="SSH">SSH</SelectItem>
                    <SelectItem value="RDP">RDP</SelectItem>
                    <SelectItem value="MySQL/Aurora">MySQL/Aurora</SelectItem>
                    <SelectItem value="Custom TCP">Custom TCP</SelectItem>
                    <SelectItem value="All traffic">All traffic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Protocol</Label>
                <Select
                  value={newRule.protocol}
                  onValueChange={(v) =>
                    setNewRule((p) => ({ ...p, protocol: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="ICMP">ICMP</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Port Range</Label>
                <Input
                  placeholder={
                    newRule.type === "All traffic" || newRule.protocol === "All"
                      ? "All"
                      : "443"
                  }
                  value={newRule.portRange}
                  onChange={(e) =>
                    setNewRule((p) => ({ ...p, portRange: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Destination</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0.0.0.0/0"
                    className="flex-1"
                    value={newRule.destination}
                    onChange={(e) =>
                      setNewRule((p) => ({ ...p, destination: e.target.value }))
                    }
                  />
                  <Button size="sm" variant="outline">
                    <Search className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Allow HTTPS egress"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (!newRule.portRange || !newRule.destination) {
                    setError("Port range and destination are required");
                    return;
                  }
                  setError(null);
                  props.onAdd?.(newRule);
                  setNewRule({
                    type: "All traffic",
                    protocol: "All",
                    portRange: "All",
                    destination: "0.0.0.0/0",
                    description: "",
                  });
                }}
              >
                Add Rule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setNewRule({
                    type: "All traffic",
                    protocol: "All",
                    portRange: "All",
                    destination: "0.0.0.0/0",
                    description: "",
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SecurityPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<SecurityPlan | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState<SecurityPlan[]>([]);
  const [inboundRules, setInboundRules] = useState<InRule[]>([]);
  const [outboundRules, setOutboundRules] = useState<OutRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SecurityPlan>({
    _id: "",
    name: "",
    description: "",
    owner: "",
    mode: "Monitor",
    targets: [],
    createdAt: "",
    updatedAt: "",
    ruleCount: 0,
  });
  const [editingInboundRules, setEditingInboundRules] = useState<InRule[]>([]);
  const [editingOutboundRules, setEditingOutboundRules] = useState<OutRule[]>([]);
  const [editingRule, setEditingRule] = useState<InRule | OutRule | null>(null);

  // Create plan state
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    owner: "",
    mode: "Monitor",
    targets: "",
    vpc: "vpc-0062881a638b09622",
  });

  // Tags state
  const [tags, setTags] = useState<
    { id: number; key: string; value: string }[]
  >([]);

  // Fetch all plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/security/plans`);
        setPlans(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch security plans"
        );
      }
    };
    fetchPlans();
  }, []);

  // Fetch rules for selected plan
  useEffect(() => {
    if (selectedPlan) {
      const fetchRules = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/security/plans/${selectedPlan._id}/rules`
          );
          const rules = response.data;
          setInboundRules(rules.filter(isInRule));
          setOutboundRules(rules.filter(isOutRule));
        } catch (err: any) {
          setError(
            err.response?.data?.message || err.message || "Failed to fetch rules"
          );
        }
      };
      fetchRules();
    }
  }, [selectedPlan]);

  // Create a new security plan
  const createPlan = async () => {
    try {
      const planData = {
        name: newPlan.name,
        description: newPlan.description,
        owner: newPlan.owner,
        mode: newPlan.mode,
        targets: newPlan.targets
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };
      if (!planData.name) {
        setError("Security plan name is required");
        return;
      }
      console.log("BASE_URL:", BASE_URL);
      console.log("Creating plan with payload:", planData);
      const response = await axios.post(
        `${BASE_URL}/security/plans`,
        planData,
        {
          timeout: 5000, // Set a 5-second timeout
        }
      );
      const createdPlan = response.data;

      // Add rules
      const rulePromises = [
        ...inboundRules.map((rule) => {
          if (!rule.source) {
            throw new Error("Source is required for inbound rules");
          }
          const rulePayload = {
            ...rule,
            planId: createdPlan._id,
            status: "Active",
            priority: rule.priority || 1,
          };
          console.log("Adding inbound rule:", rulePayload);
          return axios.post(
            `${BASE_URL}/security/plans/${createdPlan._id}/rules`,
            rulePayload
          );
        }),
        ...outboundRules.map((rule) => {
          if (!rule.destination) {
            throw new Error("Destination is required for outbound rules");
          }
          const rulePayload = {
            ...rule,
            planId: createdPlan._id,
            status: "Active",
            priority: rule.priority || 1,
          };
          console.log("Adding outbound rule:", rulePayload);
          return axios.post(
            `${BASE_URL}/security/plans/${createdPlan._id}/rules`,
            rulePayload
          );
        }),
      ];
      await Promise.all(rulePromises);

      // Fetch the plan again to get the updated ruleCount
      const planWithRules = await axios.get(`${BASE_URL}/security/plans/${createdPlan._id}`);
      const updatedPlan = planWithRules.data;

      setPlans([...plans, updatedPlan]);
      setShowCreateDialog(false);
      setNewPlan({
        name: "",
        description: "",
        owner: "",
        mode: "Monitor",
        targets: "",
        vpc: "vpc-0062881a638b09622",
      });
      setInboundRules([]);
      setOutboundRules([]);
      setTags([]);
      setError(null);
    } catch (err: any) {
      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create security plan";
      if (errorMessage === "Network Error") {
        errorMessage =
          "Unable to connect to the backend. Please ensure the server is running at http://localhost:5000.";
      } else if (errorMessage.includes("duplicate key error")) {
        errorMessage = `A security plan with name "${newPlan.name}" already exists`;
      } else if (
        errorMessage.includes("Source is required") ||
        errorMessage.includes("Destination is required")
      ) {
        errorMessage =
          "All rules must have a source (inbound) or destination (outbound)";
      }
      setError(errorMessage);
      console.error("Error creating plan:", errorMessage, {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message,
        config: err.config,
      });
    }
  };

  const handleEditPlan = async (planId: string, updatedPlanData: any) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/security/plans/${planId}`,
        updatedPlanData
      );
      // Update the plan in the UI after the successful edit
      const updatedPlan = response.data;
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === updatedPlan._id ? updatedPlan : plan
        )
      );
      setSelectedPlan(updatedPlan);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error editing plan:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update security plan"
      );
    }
  };

  // Add this function to open edit dialog and fetch rules
  const openEdit = async (plan: SecurityPlan) => {
    setEditingPlan(plan);
    try {
      const response = await axios.get(
        `${BASE_URL}/security/plans/${plan._id}/rules`
      );
      const rules = response.data;
      setEditingInboundRules(rules.filter(isInRule));
      setEditingOutboundRules(rules.filter(isOutRule));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch rules for editing"
      );
    }
    setShowEditDialog(true);
  };

  // Add this function for updating the plan (including replacing rules)
const updatePlan = async () => {
  try {
    const planData = {
      name: editingPlan.name,
      description: editingPlan.description,
      owner: editingPlan.owner,
      mode: editingPlan.mode,
      targets: editingPlan.targets,
    };
    if (!planData.name) {
      setError("Security plan name is required");
      return;
    }
    if (!editingPlan._id) {
      setError("Invalid plan ID");
      return;
    }
    console.log("Editing Plan ID:", editingPlan._id);
    console.log("Updating plan with ID:", editingPlan._id, "Data:", planData);
    const response = await axios.put(
      `${BASE_URL}/security/plans/${editingPlan._id}`,
      planData
    );
    const updatedPlan = response.data;

    // Delete all existing rules
    const currentRulesResponse = await axios.get(
      `${BASE_URL}/security/plans/${editingPlan._id}/rules`
    );
    const currentRules = currentRulesResponse.data;
    const deletePromises = currentRules.map((rule: InRule | OutRule) =>
      axios.delete(`${BASE_URL}/security/plans/${editingPlan._id}/rules/${rule._id}`)
    );
    await Promise.all(deletePromises);

    // Validate and prepare rules with all required fields
    const validatedInboundRules = editingInboundRules.filter(rule => 
      rule.source && rule.source.trim() && 
      rule.type && rule.type.trim() && 
      rule.protocol && rule.protocol.trim() && 
      rule.portRange && rule.portRange.trim()
    );
    const validatedOutboundRules = editingOutboundRules.filter(rule => 
      rule.destination && rule.destination.trim() && 
      rule.type && rule.type.trim() && 
      rule.protocol && rule.protocol.trim() && 
      rule.portRange && rule.portRange.trim()
    );

    if (validatedInboundRules.length !== editingInboundRules.length) {
      throw new Error("All inbound rules must have source, type, protocol, and port range");
    }
    if (validatedOutboundRules.length !== editingOutboundRules.length) {
      throw new Error("All outbound rules must have destination, type, protocol, and port range");
    }

    // Add the edited rules as new
    const rulePromises = [
      ...validatedInboundRules.map((rule) => {
        const rulePayload = {
          planId: updatedPlan._id,
          type: rule.type,
          protocol: rule.protocol,
          portRange: rule.portRange,
          source: rule.source,
          description: rule.description || "",
          status: "Active",
          priority: rule.priority || 1,
        };
        console.log("Validated inbound rule payload:", rulePayload);
        return axios.post(`${BASE_URL}/security/plans/${updatedPlan._id}/rules`, rulePayload);
      }),
      ...validatedOutboundRules.map((rule) => {
        const rulePayload = {
          planId: updatedPlan._id,
          type: rule.type,
          protocol: rule.protocol,
          portRange: rule.portRange,
          destination: rule.destination,
          description: rule.description || "",
          status: "Active",
          priority: rule.priority || 1,
        };
        console.log("Validated outbound rule payload:", rulePayload);
        return axios.post(`${BASE_URL}/security/plans/${updatedPlan._id}/rules`, rulePayload);
      }),
    ];
    await Promise.all(rulePromises);

    // Re-fetch the updated plan to ensure ruleCount is current
    const planResponse = await axios.get(`${BASE_URL}/security/plans/${editingPlan._id}`);
    const finalUpdatedPlan = planResponse.data;

    setPlans([
      ...plans.map((p) => (p._id === finalUpdatedPlan._id ? finalUpdatedPlan : p)),
    ]);
    if (selectedPlan?._id === finalUpdatedPlan._id) {
      setSelectedPlan(finalUpdatedPlan);
      const rulesResponse = await axios.get(`${BASE_URL}/security/plans/${finalUpdatedPlan._id}/rules`);
      const rules = rulesResponse.data;
      setInboundRules(rules.filter(isInRule));
      setOutboundRules(rules.filter(isOutRule));
    }
    setShowEditDialog(false);
    setEditingPlan({
      _id: "",
      name: "",
      description: "",
      owner: "",
      mode: "Monitor",
      targets: [],
      createdAt: "",
      updatedAt: "",
      ruleCount: 0,
    });
    setEditingInboundRules([]);
    setEditingOutboundRules([]);
    setTags([]); // If tags are used
    setError(null);
  } catch (err: any) {
    let errorMessage = err.response?.data?.message || err.message || "Failed to update security plan";
    if (errorMessage.includes("duplicate key error")) {
      errorMessage = `A security plan with name "${editingPlan.name}" already exists`;
    } else if (errorMessage.includes("Source is required") || errorMessage.includes("Destination is required")) {
      errorMessage = "All rules must have a source (inbound) or destination (outbound)";
    } else if (err.message === "Network Error") {
      errorMessage = "Unable to connect to the backend. Please ensure the server is running.";
    } else if (!err.response && err.request) {
      errorMessage = "Request failed to reach the server. Check network or server status.";
    }
    setError(errorMessage);
    console.error("Error updating plan:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config?.url,
      request: err.request,
    });
  }
};
  // Add this function for editing rules (uncomment and fix the commented one)
  const handleEditRule = async (ruleId: string, updatedRuleData: any) => {
    try {
      const planId = showEditDialog ? editingPlan._id : selectedPlan!._id;
      const response = await axios.put(
        `${BASE_URL}/security/plans/${planId}/rules/${ruleId}`,
        updatedRuleData
      );
      // Update the rule in the UI after the successful edit
      const updatedRule = response.data;
      if (showEditDialog) {
        setEditingInboundRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === updatedRule._id ? updatedRule : rule
          )
        );
        setEditingOutboundRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === updatedRule._id ? updatedRule : rule
          )
        );
      } else {
        setInboundRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === updatedRule._id ? updatedRule : rule
          )
        );
        setOutboundRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === updatedRule._id ? updatedRule : rule
          )
        );
      }
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error editing rule:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update security rule"
      );
    }
  };
  // Delete a security plan
  const deletePlan = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/security/plans/${id}`);
      setPlans(plans.filter((plan) => plan._id !== id));
      if (selectedPlan?._id === id) setSelectedPlan(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete security plan"
      );
    }
  };

  // Add a rule
  const addRule = async (
    planId: string,
    rule:
      | Omit<InRule, "_id" | "planId" | "status" | "priority">
      | Omit<OutRule, "_id" | "planId" | "status" | "priority">
  ) => {
    try {
      const rulePayload = {
        ...rule,
        planId,
        status: "Active",
        priority: 1,
      };
      console.log("Adding rule with payload:", rulePayload);
      const response = await axios.post(
        `${BASE_URL}/security/plans/${planId}/rules`,
        rulePayload
      );
      if (isInRule(response.data)) {
        setInboundRules((prev) => [...prev, response.data]);
      } else if (isOutRule(response.data)) {
        setOutboundRules((prev) => [...prev, response.data]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to add rule"
      );
      console.error("Error adding rule:", err.response?.data);
    }
  };

  // Delete a rule
  const deleteRule = async (planId: string, ruleId: string) => {
    try {
      await axios.delete(
        `${BASE_URL}/security/plans/${planId}/rules/${ruleId}`
      );
      setInboundRules((prev) => prev.filter((r) => r._id !== ruleId));
      setOutboundRules((prev) => prev.filter((r) => r._id !== ruleId));
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete rule"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Warning":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPlan) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background">
          <TopNav />
          <div className="flex">
            <Sidebar isCollapsed={false} />
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedPlan(null)}
                    >
                      ← Back to Plans
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        {selectedPlan.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {selectedPlan.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor("OK")} border`}>
                      OK
                    </Badge>
                    <Badge
                      variant={
                        selectedPlan.mode === "Enforce"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedPlan.mode}
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="w-full grid-cols-12 gap-8 flex mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="inbound-rules">
                      Inbound Rules
                    </TabsTrigger>
                    <TabsTrigger value="outbound-rules">
                      Outbound Rules
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Active Rules
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {inboundRules.length + outboundRules.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated recently
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Targets
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {selectedPlan.targets.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Domains & paths
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="rules" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Security Rules</h2>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Protocol</TableHead>
                              <TableHead>Port Range</TableHead>
                              <TableHead>Source/Destination</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...inboundRules, ...outboundRules].map((rule) => (
                              <TableRow key={rule._id}>
                                <TableCell>
                                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                </TableCell>
                                <TableCell className="font-mono">
                                  {rule.priority}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{rule.type}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {rule.protocol}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {rule.portRange}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {isInRule(rule)
                                    ? rule.source
                                    : isOutRule(rule)
                                    ? rule.destination
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {rule.description || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      rule.status === "Active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {rule.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingRule(rule)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        deleteRule(selectedPlan._id, rule._id)
                                      }
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="inbound-rules" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Inbound Rules</h2>
                        <p className="text-sm text-muted-foreground">
                          Control inbound traffic to your resources.
                        </p>
                      </div>
                    </div>
                    <InboundRulesSection
                      rules={inboundRules}
                      planId={selectedPlan._id}
                      onAdd={(rule) => addRule(selectedPlan._id, rule)}
                      onDelete={(id) => deleteRule(selectedPlan._id, id)}
                      onEdit={(rule) => setEditingRule(rule)}
                    />
                  </TabsContent>

                  <TabsContent value="outbound-rules" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          Outbound Rules
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Control outbound traffic from your resources.
                        </p>
                      </div>
                    </div>
                    <OutboundRulesSection
                      rules={outboundRules}
                      planId={selectedPlan._id}
                      onAdd={(rule) => addRule(selectedPlan._id, rule)}
                      onDelete={(id) => deleteRule(selectedPlan._id, id)}
                      onEdit={(rule) => setEditingRule(rule)}
                    />
                  </TabsContent>
                </Tabs>
                {editingRule && (
                  <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Edit {isInRule(editingRule) ? "Inbound" : "Outbound"} Rule
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={editingRule.type}
                              onValueChange={(v) =>
                                setEditingRule({ ...editingRule, type: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HTTP">HTTP</SelectItem>
                                <SelectItem value="HTTPS">HTTPS</SelectItem>
                                <SelectItem value="SSH">SSH</SelectItem>
                                <SelectItem value="RDP">RDP</SelectItem>
                                <SelectItem value="MySQL/Aurora">MySQL/Aurora</SelectItem>
                                <SelectItem value="Custom TCP">Custom TCP</SelectItem>
                                <SelectItem value="All Traffic">All Traffic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Protocol</Label>
                            <Select
                              value={editingRule.protocol}
                              onValueChange={(v) =>
                                setEditingRule({ ...editingRule, protocol: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TCP">TCP</SelectItem>
                                <SelectItem value="UDP">UDP</SelectItem>
                                <SelectItem value="ICMP">ICMP</SelectItem>
                                <SelectItem value="All">All</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Port Range</Label>
                            <Input
                              value={editingRule.portRange}
                              onChange={(e) =>
                                setEditingRule({
                                  ...editingRule,
                                  portRange: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>
                              {isInRule(editingRule) ? "Source" : "Destination"}
                            </Label>
                            <Input
                              value={
                                isInRule(editingRule)
                                  ? editingRule.source
                                  : editingRule.destination
                              }
                              onChange={(e) =>
                                setEditingRule({
                                  ...editingRule,
                                  ...(isInRule(editingRule)
                                    ? { source: e.target.value }
                                    : { destination: e.target.value }),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Description (optional)</Label>
                            <Input
                              value={editingRule.description || ""}
                              onChange={(e) =>
                                setEditingRule({
                                  ...editingRule,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (editingRule) {
                                const updatedRuleData = {
                                  type: editingRule.type,
                                  protocol: editingRule.protocol,
                                  portRange: editingRule.portRange,
                                  ...(isInRule(editingRule)
                                    ? { source: editingRule.source }
                                    : { destination: editingRule.destination }),
                                  description: editingRule.description,
                                  status: editingRule.status,
                                  priority: editingRule.priority,
                                };
                                handleEditRule(editingRule._id, updatedRuleData);
                                setEditingRule(null);
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditingRule(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Manage Security Plans
                </h1>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search plans..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[92vw] max-h-[85vh] overflow-hidden p-0">
                      <DialogHeader className="sticky top-0 z-10 bg-background border-b p-6">
                        <DialogTitle>Create Security Plan</DialogTitle>
                        <DialogDescription>
                          Create a new security plan to protect your
                          applications and infrastructure.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="overflow-y-auto max-h-[calc(85vh-8rem)] p-6 space-y-8">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Basic details{" "}
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label>
                                  Security plan name{" "}
                                  <Info className="w-3 h-3 inline text-muted-foreground" />
                                </Label>
                                <Input
                                  placeholder="MyWebServerGroup"
                                  value={newPlan.name}
                                  onChange={(e) =>
                                    setNewPlan({
                                      ...newPlan,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <p className="text-xs text-muted-foreground">
                                  Name must be unique and cannot be edited after
                                  creation.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label>
                                  Owner{" "}
                                  <Info className="w-3 h-3 inline text-muted-foreground" />
                                </Label>
                                <Input
                                  placeholder="Security Team"
                                  value={newPlan.owner}
                                  onChange={(e) =>
                                    setNewPlan({
                                      ...newPlan,
                                      owner: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>
                                Description{" "}
                                <Info className="w-3 h-3 inline text-muted-foreground" />
                              </Label>
                              <Textarea
                                placeholder="Allows SSH access to developers"
                                value={newPlan.description}
                                onChange={(e) =>
                                  setNewPlan({
                                    ...newPlan,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>
                                Mode{" "}
                                <Info className="w-3 h-3 inline text-muted-foreground" />
                              </Label>
                              <Select
                                value={newPlan.mode}
                                onValueChange={(value) =>
                                  setNewPlan({ ...newPlan, mode: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Monitor">
                                    Monitor
                                  </SelectItem>
                                  <SelectItem value="Enforce">
                                    Enforce
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>
                                Targets (comma-separated){" "}
                                <Info className="w-3 h-3 inline text-muted-foreground" />
                              </Label>
                              <Input
                                placeholder="api.devonspot.com,app.devonspot.com"
                                value={newPlan.targets}
                                onChange={(e) =>
                                  setNewPlan({
                                    ...newPlan,
                                    targets: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Inbound rules{" "}
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <InboundRulesSection
                              rules={inboundRules}
                              onAdd={(rule) =>
                                setInboundRules((prev) => [
                                  ...prev,
                                  {
                                    _id: Date.now().toString(),
                                    planId: "",
                                    ...rule,
                                    status: "Active",
                                    priority: 1,
                                  },
                                ])
                              }
                              onDelete={(id) =>
                                setInboundRules((prev) =>
                                  prev.filter((r) => r._id !== id)
                                )
                              }
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Outbound rules{" "}
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <OutboundRulesSection
                              rules={outboundRules}
                              onAdd={(rule) =>
                                setOutboundRules((prev) => [
                                  ...prev,
                                  {
                                    _id: Date.now().toString(),
                                    planId: "",
                                    ...rule,
                                    status: "Active",
                                    priority: 1,
                                  },
                                ])
                              }
                              onDelete={(id) =>
                                setOutboundRules((prev) =>
                                  prev.filter((r) => r._id !== id)
                                )
                              }
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Tags -{" "}
                              <span className="text-sm font-normal text-muted-foreground">
                                optional
                              </span>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              A tag is a label that you assign to a resource.
                              Each tag consists of a key and an optional value.
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {tags.length === 0 ? (
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  No tags associated with the resource.
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setTags([{ id: 1, key: "", value: "" }])
                                  }
                                  className="bg-white text-black hover:bg-gray-100 hover:text-black"
                                >
                                  Add new tag
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                  You can add up to 50 more tags.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {tags.map((tag) => (
                                  <div key={tag.id} className="flex gap-2">
                                    <Input
                                      placeholder="Key"
                                      className="flex-1"
                                      value={tag.key}
                                      onChange={(e) =>
                                        setTags((prev) =>
                                          prev.map((t) =>
                                            t.id === tag.id
                                              ? { ...t, key: e.target.value }
                                              : t
                                          )
                                        )
                                      }
                                    />
                                    <Input
                                      placeholder="Value"
                                      className="flex-1"
                                      value={tag.value}
                                      onChange={(e) =>
                                        setTags((prev) =>
                                          prev.map((t) =>
                                            t.id === tag.id
                                              ? { ...t, value: e.target.value }
                                              : t
                                          )
                                        )
                                      }
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setTags(
                                          tags.filter((t) => t.id !== tag.id)
                                        )
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setTags([
                                      ...tags,
                                      { id: Date.now(), key: "", value: "" },
                                    ])
                                  }
                                >
                                  Add new tag
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <div className="sticky bottom-0 z-10 bg-background border-t p-4 flex justify-end gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={createPlan}
                        >
                          Create security plan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {filteredPlans.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      No security plans found
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? "No plans match your search criteria."
                        : "Create your first security plan to get started."}
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Security Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Targets</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Rules</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPlans.map((plan) => (
                          <TableRow
                            key={plan._id}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{plan.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {plan.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {plan.targets
                                  .slice(0, 2)
                                  .map((target, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {target}
                                    </Badge>
                                  ))}
                                {plan.targets.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{plan.targets.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  plan.mode === "Enforce"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {plan.mode}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              {plan.ruleCount}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(plan.updatedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedPlan(plan)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEdit(plan)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deletePlan(plan._id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-5xl w-[92vw] max-h-[85vh] overflow-hidden p-0">
            <DialogHeader className="sticky top-0 z-10 bg-background border-b p-6">
              <DialogTitle>Edit Security Plan</DialogTitle>
              <DialogDescription>
                Update the security plan details and rules.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-8rem)] p-6 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Basic details <Info className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>
                        Security plan name{" "}
                        <Info className="w-3 h-3 inline text-muted-foreground" />
                      </Label>
                      <Input
                        placeholder="MyWebServerGroup"
                        value={editingPlan.name}
                        disabled // Name cannot be edited
                      />
                      <p className="text-xs text-muted-foreground">
                        Name must be unique and cannot be edited after creation.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Owner{" "}
                        <Info className="w-3 h-3 inline text-muted-foreground" />
                      </Label>
                      <Input
                        placeholder="Security Team"
                        value={editingPlan.owner}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, owner: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Description{" "}
                      <Info className="w-3 h-3 inline text-muted-foreground" />
                    </Label>
                    <Textarea
                      placeholder="Allows SSH access to developers"
                      value={editingPlan.description}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Mode <Info className="w-3 h-3 inline text-muted-foreground" />
                    </Label>
                    <Select
                      value={editingPlan.mode}
                      onValueChange={(value) =>
                        setEditingPlan({ ...editingPlan, mode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monitor">Monitor</SelectItem>
                        <SelectItem value="Enforce">Enforce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Targets (comma-separated){" "}
                      <Info className="w-3 h-3 inline text-muted-foreground" />
                    </Label>
                    <Input
                      placeholder="api.devonspot.com,app.devonspot.com"
                      value={editingPlan.targets.join(",")}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          targets: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter((t) => t),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Inbound rules <Info className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InboundRulesSection
                    rules={editingInboundRules}
                    onAdd={(rule) =>
                      setEditingInboundRules((prev) => [
                        ...prev,
                        {
                          _id: Date.now().toString(),
                          planId: "",
                          ...rule,
                          status: "Active",
                          priority: 1,
                        },
                      ])
                    }
                    onDelete={(id) =>
                      setEditingInboundRules((prev) =>
                        prev.filter((r) => r._id !== id)
                      )
                    }
                    onEdit={(rule) => setEditingRule(rule)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Outbound rules <Info className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OutboundRulesSection
                    rules={editingOutboundRules}
                    onAdd={(rule) =>
                      setEditingOutboundRules((prev) => [
                        ...prev,
                        {
                          _id: Date.now().toString(),
                          planId: "",
                          ...rule,
                          status: "Active",
                          priority: 1,
                        },
                      ])
                    }
                    onDelete={(id) =>
                      setEditingOutboundRules((prev) =>
                        prev.filter((r) => r._id !== id)
                      )
                    }
                    onEdit={(rule) => setEditingRule(rule)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Tags -{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      optional
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A tag is a label that you assign to a resource. Each tag consists
                    of a key and an optional value.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tags.length === 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        No tags associated with the resource.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setTags([{ id: 1, key: "", value: "" }])}
                      >
                        Add new tag
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        You can add up to 50 more tags.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex gap-2">
                          <Input
                            placeholder="Key"
                            className="flex-1"
                            value={tag.key}
                            onChange={(e) =>
                              setTags((prev) =>
                                prev.map((t) =>
                                  t.id === tag.id ? { ...t, key: e.target.value } : t
                                )
                              )
                            }
                          />
                          <Input
                            placeholder="Value"
                            className="flex-1"
                            value={tag.value}
                            onChange={(e) =>
                              setTags((prev) =>
                                prev.map((t) =>
                                  t.id === tag.id
                                    ? { ...t, value: e.target.value }
                                    : t
                                )
                              )
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setTags(tags.filter((t) => t.id !== tag.id))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setTags([...tags, { id: Date.now(), key: "", value: "" }])
                        }
                      >
                        Add new tag
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="sticky bottom-0 z-10 bg-background border-t p-4 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-white text-black hover:bg-gray-100"
                onClick={updatePlan}
              >
                Update security plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}