import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function Alerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 5000,
  });

  const activeAlerts = (alerts || []).filter((alert: any) => alert.status === "ACTIVE");
  const resolvedAlerts = (alerts || []).filter((alert: any) => alert.status === "RESOLVED");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Alerts</h1>
        <p className="text-muted-foreground">
          Review and manage fraud detection alerts
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{(alerts || []).length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Active Alerts ({activeAlerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No active alerts - all clear!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert: any) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            alert.priority === "HIGH" ? "destructive" :
                            alert.priority === "MEDIUM" ? "default" : "secondary"
                          }
                        >
                          {alert.priority} PRIORITY
                        </Badge>
                        <Badge variant="outline">
                          {alert.alertType}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{alert.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        Transaction ID: {alert.transactionId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {alert.details?.mlScore && (
                        <p className="text-sm font-medium">
                          Risk Score: {(parseFloat(alert.details.mlScore) * 100).toFixed(1)}%
                        </p>
                      )}
                      {alert.details?.riskLevel && (
                        <Badge 
                          variant={
                            alert.details.riskLevel === "HIGH" ? "destructive" :
                            alert.details.riskLevel === "MEDIUM" ? "default" : "secondary"
                          }
                          className="mt-1"
                        >
                          {alert.details.riskLevel} RISK
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Alert Details */}
                  {alert.details?.flags && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Detected Issues:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.details.flags.highValue && (
                          <Badge variant="outline">High Value Transaction</Badge>
                        )}
                        {alert.details.flags.structuring && (
                          <Badge variant="outline">Structuring Pattern</Badge>
                        )}
                        {alert.details.flags.geoVelocity && (
                          <Badge variant="outline">Geo-Velocity Violation</Badge>
                        )}
                        {alert.details.flags.ipMismatch && (
                          <Badge variant="outline">IP Mismatch</Badge>
                        )}
                        {alert.details.flags.multipleFailures && (
                          <Badge variant="outline">Multiple Failures</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Recently Resolved ({resolvedAlerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Resolved: {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    RESOLVED
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}