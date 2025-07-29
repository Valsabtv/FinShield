import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, AlertTriangle, TrendingUp, Shield } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Analytics() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/metrics/latest"],
    refetchInterval: 30000,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: 30000,
  });

  if (metricsLoading || alertsLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-60 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const processedMetrics = metrics?.reduce((acc: any, metric: any) => {
    acc[metric.metricName] = parseFloat(metric.metricValue);
    return acc;
  }, {});

  const alertPriorityData = alerts ? Object.entries(alerts.reduce((acc: any, alert: any) => {
    acc[alert.priority] = (acc[alert.priority] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value })) : [];

  const transactionTypeData = transactions ? Object.entries(transactions.reduce((acc: any, txn: any) => {
    acc[txn.transactionType] = (acc[txn.transactionType] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        <p className="text-muted-foreground mt-2">
          Gain insights into system performance and fraud detection effectiveness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Key Performance Indicators */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {(processedMetrics?.model_accuracy * 100 || 0).toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{alerts?.length || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{transactions?.length || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Alert Priority Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alert Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertPriorityData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Performance Metrics */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg. Detection Time</p>
                <p className="text-xl font-bold">{processedMetrics?.avg_detection_time || 0}s</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Precision</p>
                <p className="text-xl font-bold">{(processedMetrics?.precision * 100 || 0).toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Recall</p>
                <p className="text-xl font-bold">{(processedMetrics?.recall * 100 || 0).toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">ROC AUC</p>
                <p className="text-xl font-bold">{(processedMetrics?.roc_auc || 0).toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
