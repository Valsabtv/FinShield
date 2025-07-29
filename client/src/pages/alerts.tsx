import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AlertCard from "@/components/alerts/alert-card";
import { AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/alerts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Alert Updated",
        description: "Alert status has been updated successfully.",
      });
    },
  });

  const filteredAlerts = (alerts || []).filter((alert: any) => {
    const matchesPriority = priorityFilter === "ALL" || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || alert.status === statusFilter;
    return matchesPriority && matchesStatus;
  }) || [];

  const alertCounts = {
    total: (alerts || []).length,
    active: (alerts || []).filter((a: any) => a.status === "ACTIVE").length,
    resolved: (alerts || []).filter((a: any) => a.status === "RESOLVED").length,
    high: (alerts || []).filter((a: any) => a.priority === "HIGH").length,
    medium: (alerts || []).filter((a: any) => a.priority === "MEDIUM").length,
    low: (alerts || []).filter((a: any) => a.priority === "LOW").length,
  };

  const handleResolveAlert = (alertId: string) => {
    updateAlertMutation.mutate({
      id: alertId,
      updates: { status: "RESOLVED" }
    });
  };

  const handleDismissAlert = (alertId: string) => {
    updateAlertMutation.mutate({
      id: alertId,
      updates: { status: "DISMISSED" }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alert Queue</h1>
        <p className="text-muted-foreground">
          Manage and review fraud detection alerts
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{alertCounts.active}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{alertCounts.high}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{alertCounts.medium}</div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{alertCounts.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="LOW">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">
              Showing {filteredAlerts.length} of {alertCounts.total} alerts
            </Badge>
            {priorityFilter !== "ALL" && (
              <Badge variant="outline">Priority: {priorityFilter}</Badge>
            )}
            {statusFilter !== "ALL" && (
              <Badge variant="outline">Status: {statusFilter}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Clock className="w-6 h-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading alerts...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No alerts match the current filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert: any) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => handleResolveAlert(alert.id)}
              onDismiss={() => handleDismissAlert(alert.id)}
              showActions
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPriorityFilter("HIGH")}
            >
              View High Priority ({alertCounts.high})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("ACTIVE")}
            >
              View Active Alerts ({alertCounts.active})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPriorityFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
