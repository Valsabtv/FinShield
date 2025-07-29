import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface AlertCardProps {
  alert: any;
  onResolve?: () => void;
  onDismiss?: () => void;
  showActions?: boolean;
}

export default function AlertCard({ alert, onResolve, onDismiss, showActions = false }: AlertCardProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-red-200 bg-red-50";
      case "MEDIUM":
        return "border-orange-200 bg-orange-50";
      case "LOW":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const alertTime = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  return (
    <Card className={`border ${getPriorityColor(alert.priority)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant={getPriorityVariant(alert.priority)}>
                {alert.priority}
              </Badge>
              <span className="text-sm font-medium">
                Transaction ID: {alert.details?.transactionId || alert.transactionId}
              </span>
              <span className="text-xs text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                {getTimeAgo(alert.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
            
            {alert.details && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {alert.details.mlScore && (
                  <span>ML Score: {parseFloat(alert.details.mlScore).toFixed(2)}</span>
                )}
                {alert.details.amount && (
                  <span>Amount: ${parseFloat(alert.details.amount).toLocaleString()}</span>
                )}
                {alert.details.accountId && (
                  <span>Account: ****{alert.details.accountId.slice(-4)}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {alert.status === "ACTIVE" && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            {alert.status === "RESOLVED" && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            
            {showActions && alert.status === "ACTIVE" && (
              <>
                {onResolve && (
                  <Button variant="outline" size="sm" onClick={onResolve}>
                    Resolve
                  </Button>
                )}
                {onDismiss && (
                  <Button variant="ghost" size="sm" onClick={onDismiss}>
                    Dismiss
                  </Button>
                )}
              </>
            )}
            
            {!showActions && (
              <Button variant="link" size="sm" className="text-primary">
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
