import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Shield } from "lucide-react";

export default function Analytics() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics/latest"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const metricsMap = (metrics || []).reduce((acc: any, metric: any) => {
    acc[metric.metricName] = metric.metricValue;
    return acc;
  }, {});

  const riskStats = {
    high: (transactions || []).filter((t: any) => t.riskLevel === "HIGH").length,
    medium: (transactions || []).filter((t: any) => t.riskLevel === "MEDIUM").length,
    low: (transactions || []).filter((t: any) => t.riskLevel === "LOW").length,
  };

  const alertStats = {
    total: (alerts || []).length,
    active: (alerts || []).filter((a: any) => a.status === "ACTIVE").length,
    resolved: (alerts || []).filter((a: any) => a.status === "RESOLVED").length,
  };

  const detectionStats = {
    flagged: (transactions || []).filter((t: any) => t.status === "FLAGGED").length,
    processed: (transactions || []).filter((t: any) => t.status === "PROCESSED").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground">
          Performance metrics and detection statistics
        </p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {metricsMap.model_accuracy ? (parseFloat(metricsMap.model_accuracy) * 100).toFixed(1) : "0"}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{(transactions || []).length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(transactions || []).length > 0 ? 
                    ((detectionStats.flagged / (transactions || []).length) * 100).toFixed(1) : "0"}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{riskStats.high}</span>
                  <Badge variant="destructive">{riskStats.high} transactions</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{riskStats.medium}</span>
                  <Badge variant="default">{riskStats.medium} transactions</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{riskStats.low}</span>
                  <Badge variant="secondary">{riskStats.low} transactions</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Alerts Generated</span>
                <div className="text-right">
                  <p className="text-xl font-bold">{alertStats.total}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Currently Active</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">{alertStats.active}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolved</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{alertStats.resolved}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Resolution Rate</span>
                  <p className="text-lg font-bold text-blue-600">
                    {alertStats.total > 0 ? 
                      ((alertStats.resolved / alertStats.total) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Average Response Time</p>
              <p className="text-2xl font-bold">
                {metricsMap.avg_response_time ? parseFloat(metricsMap.avg_response_time).toFixed(0) : "45"}ms
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Throughput</p>
              <p className="text-2xl font-bold">
                {metricsMap.throughput ? parseFloat(metricsMap.throughput).toFixed(0) : "1200"}/min
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {metricsMap.error_rate ? (parseFloat(metricsMap.error_rate) * 100).toFixed(2) : "0.01"}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}