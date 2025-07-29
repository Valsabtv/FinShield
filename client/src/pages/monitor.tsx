import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TransactionTable from "@/components/transactions/transaction-table";
import { Search, Filter, RefreshCw } from "lucide-react";

export default function Monitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const filteredTransactions = (transactions || []).filter((transaction: any) => {
    const matchesSearch = searchTerm === "" || 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === "ALL" || transaction.riskLevel === riskFilter;
    const matchesStatus = statusFilter === "ALL" || transaction.status === statusFilter;
    
    return matchesSearch && matchesRisk && matchesStatus;
  }) || [];

  const riskCounts = {
    HIGH: (transactions || []).filter((t: any) => t.riskLevel === "HIGH").length,
    MEDIUM: (transactions || []).filter((t: any) => t.riskLevel === "MEDIUM").length,
    LOW: (transactions || []).filter((t: any) => t.riskLevel === "LOW").length,
  };

  const statusCounts = {
    FLAGGED: (transactions || []).filter((t: any) => t.status === "FLAGGED").length,
    BLOCKED: (transactions || []).filter((t: any) => t.status === "BLOCKED").length,
    CHALLENGED: (transactions || []).filter((t: any) => t.status === "CHALLENGED").length,
    PROCESSED: (transactions || []).filter((t: any) => t.status === "PROCESSED").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of transaction processing and risk assessment
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{transactions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{riskCounts.HIGH}</div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{riskCounts.MEDIUM}</div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.FLAGGED}</div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Transaction ID or Account ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Risk Levels</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="FLAGGED">Flagged</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="CHALLENGED">Challenged</SelectItem>
                <SelectItem value="PROCESSED">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">
              Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
            </Badge>
            {riskFilter !== "ALL" && (
              <Badge variant="outline">Risk: {riskFilter}</Badge>
            )}
            {statusFilter !== "ALL" && (
              <Badge variant="outline">Status: {statusFilter}</Badge>
            )}
            {searchTerm && (
              <Badge variant="outline">Search: "{searchTerm}"</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : (
            <TransactionTable transactions={filteredTransactions} showPagination />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
