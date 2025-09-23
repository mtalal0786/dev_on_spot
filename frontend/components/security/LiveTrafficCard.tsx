import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Pause, Play } from "lucide-react";
import axios from "axios";

interface TrafficEntry {
  _id: string;
  projectId: {
    _id: string;
    projectName: string;
  }; // Populated ObjectId reference
  method: string;
  path: string;
  status: "ALLOW" | "BLOCK";
  statusCode: number;
  ip: string;
  country: string;
  timestamp: string;
}

interface Project {
  _id: string;
  projectName: string; // Adjusted to match schema
  projectDescription?: string;
}

export default function LiveTrafficCard() {
  const [traffic, setTraffic] = useState<TrafficEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [trafficFilter, setTrafficFilter] = useState<string>("All");
  const [trafficPaused, setTrafficPaused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE}/security/traffic/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map response to match Project interface
      setProjects(
        response.data.map((p: any) => ({
          _id: p._id,
          projectName: p.projectName,
          projectDescription: p.projectDescription,
        }))
      );
      if (response.data.length > 0) {
        setSelectedProjectId(response.data[0]._id); // Default to first project
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  // Fetch traffic logs for selected project
  const fetchTraffic = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        projectId: selectedProjectId,
        limit: "20",
        filter: trafficFilter,
      });
      const response = await axios.get(`${API_BASE}/security/traffic/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTraffic(response.data);
    } catch (err) {
      console.error("Failed to fetch traffic:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate new traffic entry (simulate real-time addition)
  const generateNewTraffic = async () => {
    if (!selectedProjectId || trafficPaused) return;
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_BASE}/security/traffic/generate`,
        { projectId: selectedProjectId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Immediately fetch the updated traffic list
      await fetchTraffic();
    } catch (err) {
      console.error("Failed to generate traffic:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTraffic();
    }
  }, [selectedProjectId, trafficFilter]);

  useEffect(() => {
    if (!trafficPaused) {
      const interval = setInterval(generateNewTraffic, 2000); // Generate every 2 seconds
      return () => clearInterval(interval);
    }
  }, [selectedProjectId, trafficPaused]);

  const filteredTraffic = traffic.filter((entry) =>
    trafficFilter === "All" || entry.status === trafficFilter
  );

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Live Traffic
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTrafficPaused(!trafficPaused)}
            >
              {trafficPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </Button>
            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value)}
              className="text-xs bg-background border rounded px-2 py-1"
            >
              <option>All</option>
              <option>Blocked</option>
              <option>Allowed</option>
            </select>
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs bg-background border rounded px-2 py-1"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading traffic...</div>
          ) : filteredTraffic.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No traffic to display. Select a project to start.
            </div>
          ) : (
            filteredTraffic.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between text-xs p-2 rounded bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={entry.status === "ALLOW" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {entry.status}
                  </Badge>
                  <span className="font-mono">{entry.method}</span>
                  <span className="truncate max-w-24">{entry.path}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{entry.ip}</span>
                  <span>{entry.country}</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}