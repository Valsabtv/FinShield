import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import RiskChart from "@/components/charts/risk-chart";
import { BarChart3, TrendingUp, Target, Clock, Shield, AlertTriangle } from "lucide-react";

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

  const riskDistribution = {
    low: (transactions || []).filter((t: any) => t.riskLevel === "LOW").length,
    medium: (transactions || []).filter((t: any) => t.riskLevel === "MEDIUM").length,
    high: (transactions || []).filter((t: any) => t.riskLevel === "HIGH").length,
  };

  const alertStats = {
    total: (alerts || []).length,
    active: (alerts || []).filter((a: any) => a.status === "ACTIVE").length,
    resolved: (alerts || []).filter((a: any) => a.status === "RESOLVED").length,
    byPriority: {
      high: (alerts || []).filter((a: any) => a.priority === "HIGH").length,
      medium: (alerts || []).filter((a: any) => a.priority === "MEDIUM").length,
      low: (alerts || []).filter((a: any) => a.priority === "LOW").length,
    }
  };

  const detectionStats = {
    flagged: (transactions || []).filter((t: any) => t.status === "FLAGGED").length,
    blocked: (transactions || []).filter((t: any) => t.status === "BLOCKED").length,
    challenged: (transactions || []).filter((t: any) => t.status === "CHALLENGED").length,
    processed: (transactions || []).filter((t: any) => t.status === "PROCESSED").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Performance metrics and fraud detection analytics
        </p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {metricsMap.model_accuracy ? (parseFloat(metricsMap.model_accuracy) * 100).toFixed(1) : "0"}%
                </p>
                <p className="text-sm text-green-600">Excellent performance</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {transactions?.length ? ((detectionStats.flagged + detectionStats.blocked) / transactions.length * 100).toFixed(1) : "0"}%
                </p>
                <p className="text-sm text-blue-600">Fraud caught</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">False Positive Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metricsMap.false_positive_rate ? (parseFloat(metricsMap.false_positive_rate) * 100).toFixed(1) : "0"}%
                </p>
                <p className="text-sm text-orange-600">Target: &lt;2%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Detection Time</p>
                <p className="text-2xl font-bold text-purple-600">{metricsMap.avg_detection_time || "0"}min</p>
                <p className="text-sm text-purple-600">Real-time processing</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis & Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskChart data={riskDistribution} />
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Risk Transactions</span>
                <Badge className="bg-green-100 text-green-800">
                  {riskDistribution.low} ({transactions?.length ? (riskDistribution.low / transactions.length * 100).toFixed(1) : 0}%)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Risk Transactions</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {riskDistribution.medium} ({transactions?.length ? (riskDistribution.medium / transactions.length * 100).toFixed(1) : 0}%)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Risk Transactions</span>
                <Badge className="bg-red-100 text-red-800">
                  {riskDistribution.high} ({transactions?.length ? (riskDistribution.high / transactions.length * 100).toFixed(1) : 0}%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ML Model Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Precision</span>
                <span className="text-sm font-medium">
                  {metricsMap.precision ? (parseFloat(metricsMap.precision) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={metricsMap.precision ? parseFloat(metricsMap.precision) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Recall</span>
                <span className="text-sm font-medium">
                  {metricsMap.recall ? (parseFloat(metricsMap.recall) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={metricsMap.recall ? parseFloat(metricsMap.recall) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">ROC-AUC Score</span>
                <span className="text-sm font-medium">{metricsMap.roc_auc || "0"}</span>
              </div>
              <Progress 
                value={metricsMap.roc_auc ? parseFloat(metricsMap.roc_auc) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">F1-Score</span>
                <span className="text-sm font-medium">
                  {metricsMap.precision && metricsMap.recall ? 
                    (2 * parseFloat(metricsMap.precision) * parseFloat(metricsMap.recall) / 
                     (parseFloat(metricsMap.precision) + parseFloat(metricsMap.recall)) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={metricsMap.precision && metricsMap.recall ? 
                  2 * parseFloat(metricsMap.precision) * parseFloat(metricsMap.recall) / 
                  (parseFloat(metricsMap.precision) + parseFloat(metricsMap.recall)) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Analytics & Detection Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alert Management Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{alertStats.byPriority.high}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{alertStats.byPriority.medium}</div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Alerts</span>
                <Badge variant="destructive">{alertStats.active}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolved Alerts</span>
                <Badge className="bg-green-100 text-green-800">{alertStats.resolved}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolution Rate</span>
                <span className="text-sm font-medium">
                  {alertStats.total ? (alertStats.resolved / alertStats.total * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Processing Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{detectionStats.processed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{detectionStats.flagged}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Blocked Transactions</span>
                <Badge variant="destructive">{detectionStats.blocked}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Challenged Transactions</span>
                <Badge className="bg-orange-100 text-orange-800">{detectionStats.challenged}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Processing Rate</span>
                <span className="text-sm font-medium">1,247 txn/min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            System Health & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">System Uptime</span>
                <span className="text-sm font-medium text-green-600">99.97%</span>
              </div>
              <Progress value={99.97} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">ML Model Health</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-medium text-green-600">145ms</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>Last Model Training:</strong> Jan 15, 2024 14:23 UTC</p>
            <p><strong>Next Scheduled Update:</strong> Jan 22, 2024 14:00 UTC</p>
            <p><strong>Data Sources:</strong> 4 active integrations, 98.5% data quality score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
