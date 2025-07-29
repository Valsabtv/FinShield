import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle, Shield, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div>
        <h1 className="text-3xl font-bold">{import.meta.env.VITE_APP_NAME || "BankGuardian"}</h1>
        <p className="text-muted-foreground mt-2">
          Monitor transactions and detect suspicious activities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats?.metrics?.transactions_today || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Transactions</p>
                <p className="text-2xl font-bold text-red-600">{stats?.flaggedTransactions || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{alerts?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.metrics?.model_accuracy ? (parseFloat(stats.metrics.model_accuracy) * 100).toFixed(1) : "0"}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Risk</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats?.riskDistribution ? (stats.riskDistribution.high / (stats.riskDistribution.high + stats.riskDistribution.medium + stats.riskDistribution.low)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats?.riskDistribution?.high || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Risk</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats?.riskDistribution ? (stats.riskDistribution.medium / (stats.riskDistribution.high + stats.riskDistribution.medium + stats.riskDistribution.low)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats?.riskDistribution?.medium || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Risk</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats?.riskDistribution ? (stats.riskDistribution.low / (stats.riskDistribution.high + stats.riskDistribution.medium + stats.riskDistribution.low)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats?.riskDistribution?.low || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions?.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{transaction.transactionId}</p>
                    <p className="text-xs text-muted-foreground">${transaction.amount}</p>
                  </div>
                  <Badge 
                    variant={
                      transaction.riskLevel === "HIGH" ? "destructive" :
                      transaction.riskLevel === "MEDIUM" ? "default" : "secondary"
                    }
                  >
                    {transaction.riskLevel}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}