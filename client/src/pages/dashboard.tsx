import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RiskChart from "@/components/charts/risk-chart";
import TransactionTable from "@/components/transactions/transaction-table";
import AlertCard from "@/components/alerts/alert-card";
import { 
  TrendingUp, 
  Flag, 
  Target, 
  Clock, 
  DollarSign, 
  Clock4, 
  MapPin, 
  Smartphone, 
  Shield,
  ExternalLink
} from "lucide-react";

interface DashboardStats {
  metrics: Record<string, string>;
  alertCounts: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  flaggedTransactions: number;
  recentTransactions: any[];
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* System Status Banner */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">System Status: Operational</h3>
                <p className="text-sm opacity-90">
                  ML Model: Active | Last Updated: 2 hours ago | Processing: 1,247 transactions/min
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Uptime</div>
              <div className="font-bold text-xl">99.97%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions Today</p>
                <p className="text-2xl font-bold">{stats?.metrics.transactions_today || "0"}</p>
                <p className="text-sm text-green-600">+12.5% from yesterday</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Transactions</p>
                <p className="text-2xl font-bold text-red-600">{stats?.flaggedTransactions || "0"}</p>
                <p className="text-sm text-red-600">+3 in last hour</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.metrics.model_accuracy ? (parseFloat(stats.metrics.model_accuracy) * 100).toFixed(1) : "0"}%
                </p>
                <p className="text-sm text-green-600">ROC-AUC: {stats?.metrics.roc_auc || "0"}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Detection Time</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.metrics.avg_detection_time || "0"}min</p>
                <p className="text-sm text-muted-foreground">Target: &lt;5min</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Upload & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Transaction Upload
              <DollarSign className="w-5 h-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                <TrendingUp className="w-full h-full" />
              </div>
              <p className="text-muted-foreground mb-2">Drop CSV file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports CSV, JSON, XML formats</p>
              <Button className="mt-4">Browse Files</Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <strong>ML Model Integration:</strong>
                <a 
                  href="https://github.com/mvram123/Money_Laundering_Detection" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Money_Laundering_Detection
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskChart data={stats?.riskDistribution} />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <span className="text-sm font-medium">{stats?.riskDistribution.low || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <span className="text-sm font-medium">{stats?.riskDistribution.medium || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <span className="text-sm font-medium">{stats?.riskDistribution.high || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Extraction Display */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Feature Extraction Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Monetary</h4>
              <p className="text-xs text-muted-foreground mt-1">Amount, Velocity, Ticket Size</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock4 className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Temporal</h4>
              <p className="text-xs text-muted-foreground mt-1">Time patterns, Intervals</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Location</h4>
              <p className="text-xs text-muted-foreground mt-1">IP, Geo-velocity, Channel</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Device</h4>
              <p className="text-xs text-muted-foreground mt-1">Fingerprint, Behavior</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Identity</h4>
              <p className="text-xs text-muted-foreground mt-1">Email, Phone, Profile</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Alerts & ML Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>High Priority Alerts</CardTitle>
              <Badge variant="destructive">{stats?.alertCounts.total || 0} Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts && alerts.length > 0 ? alerts.slice(0, 3).map((alert: any) => (
                <AlertCard key={alert.id} alert={alert} />
              )) : null}
              {(!alerts || alerts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts
                </div>
              )}
              <div className="text-center pt-2">
                <Button variant="link" size="sm">
                  View All Alerts ({stats?.alertCounts.total || 0})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ML Performance
              <Target className="w-5 h-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Precision</span>
                <span className="text-sm font-medium">
                  {stats?.metrics.precision ? (parseFloat(stats.metrics.precision) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={stats?.metrics.precision ? parseFloat(stats.metrics.precision) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Recall</span>
                <span className="text-sm font-medium">
                  {stats?.metrics.recall ? (parseFloat(stats.metrics.recall) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={stats?.metrics.recall ? parseFloat(stats.metrics.recall) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">ROC-AUC</span>
                <span className="text-sm font-medium">{stats?.metrics.roc_auc || "0"}</span>
              </div>
              <Progress 
                value={stats?.metrics.roc_auc ? parseFloat(stats.metrics.roc_auc) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">False Positive Rate</span>
                <span className="text-sm font-medium">
                  {stats?.metrics.false_positive_rate ? (parseFloat(stats.metrics.false_positive_rate) * 100).toFixed(1) : "0"}%
                </span>
              </div>
              <Progress 
                value={stats?.metrics.false_positive_rate ? (100 - parseFloat(stats.metrics.false_positive_rate) * 100) : 100} 
                className="h-2"
              />
            </div>
            
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Last Model Update</div>
                <div className="text-sm font-medium">Jan 15, 2024 14:23 UTC</div>
                <div className="text-xs text-green-600 mt-1">Training completed successfully</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Rule-Based Filters Status */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Rule-Based Pre-Filtering Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">High-Value</h4>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Amount &gt; $10,000</p>
              <div className="text-lg font-bold text-red-600">23</div>
              <div className="text-xs text-muted-foreground">triggered today</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Structuring</h4>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">≥3 under $10K/24h</p>
              <div className="text-lg font-bold text-red-600">8</div>
              <div className="text-xs text-muted-foreground">triggered today</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">IP Mismatch</h4>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Billing ≠ IP country</p>
              <div className="text-lg font-bold text-orange-600">15</div>
              <div className="text-xs text-muted-foreground">triggered today</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Geo-Velocity</h4>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">&gt;500km in 1h</p>
              <div className="text-lg font-bold text-red-600">4</div>
              <div className="text-xs text-muted-foreground">triggered today</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Failed Attempts</h4>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">&gt;5 failures/session</p>
              <div className="text-lg font-bold text-orange-600">11</div>
              <div className="text-xs text-muted-foreground">triggered today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction Analysis Sample</CardTitle>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={stats?.recentTransactions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
