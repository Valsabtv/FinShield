import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000,
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { status: string } }) => {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update alert");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Alert Updated",
        description: "Alert status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleResolve = (id: string) => {
    updateAlertMutation.mutate({ id, updates: { status: "RESOLVED" } });
  };

  const handleDismiss = (id: string) => {
    updateAlertMutation.mutate({ id, updates: { status: "DISMISSED" } });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alert Queue</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage suspicious activity alerts
        </p>
      </div>

      {alerts && alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert: any) => (
            <Card key={alert.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Alert ID: {alert.id.substring(0, 8)}
                </CardTitle>
                <Badge
                  variant={
                    alert.priority === "HIGH" ? "destructive" :
                    alert.priority === "MEDIUM" ? "default" : "secondary"
                  }
                >
                  {alert.priority}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{alert.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transaction ID: {alert.transactionId.substring(0, 8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {alert.alertType}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {alert.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(alert.createdAt).toLocaleString()}
                </p>
                {alert.status === "ACTIVE" && (
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      disabled={updateAlertMutation.isPending}
                    >
                      {updateAlertMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(alert.id)}
                      disabled={updateAlertMutation.isPending}
                    >
                      {updateAlertMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No active alerts at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
