import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionTableProps {
  transactions: any[];
  showPagination?: boolean;
}

export default function TransactionTable({ transactions, showPagination = false }: TransactionTableProps) {
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "FLAGGED":
        return "destructive";
      case "BLOCKED":
        return "destructive";
      case "CHALLENGED":
        return "secondary";
      case "PROCESSED":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatShapExplanation = (shapExplanation: any) => {
    if (!shapExplanation) return "N/A";
    
    const topFeatures = Object.entries(shapExplanation)
      .sort(([,a], [,b]) => Math.abs(Number(b)) - Math.abs(Number(a)))
      .slice(0, 3)
      .map(([feature, value]) => `${feature} (${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(1)})`)
      .join(', ');
    
    return topFeatures;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <p>No transactions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
              <th className="text-left py-3 px-4 font-medium">Amount</th>
              <th className="text-left py-3 px-4 font-medium">Account</th>
              <th className="text-left py-3 px-4 font-medium">Risk Score</th>
              <th className="text-left py-3 px-4 font-medium">SHAP Explanation</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm">
                  {transaction.transactionId}
                </td>
                <td className="py-3 px-4">
                  ${parseFloat(transaction.amount).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  ****{transaction.accountId.slice(-4)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={getRiskBadgeVariant(transaction.riskLevel)}>
                    {transaction.mlScore ? parseFloat(transaction.mlScore).toFixed(2) : "0.00"} {transaction.riskLevel}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                  {formatShapExplanation(transaction.shapExplanation)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    {transaction.status === "FLAGGED" && (
                      <Button variant="link" size="sm" className="text-primary">
                        Review
                      </Button>
                    )}
                    <Button variant="link" size="sm" className="text-muted-foreground">
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showPagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} transactions
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
