import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw } from "lucide-react";

export default function Monitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: 10000,
  });

  const filteredTransactions = (transactions || []).filter((transaction: any) => {
    const matchesSearch = searchTerm === "" || 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === "ALL" || transaction.riskLevel === riskFilter;
    
    return matchesSearch && matchesRisk;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Monitor</h1>
          <p className="text-muted-foreground">
            Monitor all transactions in real-time
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by transaction ID or account ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Risk Levels</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction: any) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{transaction.transactionId}</span>
                        <Badge 
                          variant={
                            transaction.riskLevel === "HIGH" ? "destructive" :
                            transaction.riskLevel === "MEDIUM" ? "default" : "secondary"
                          }
                        >
                          {transaction.riskLevel}
                        </Badge>
                        <Badge variant="outline">
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Account: {transaction.accountId} • Amount: ${transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Risk Score: {transaction.mlScore ? (parseFloat(transaction.mlScore) * 100).toFixed(1) : "N/A"}%
                      </p>
                      {transaction.alertGenerated && (
                        <Badge variant="destructive" className="mt-1">
                          Alert Generated
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}