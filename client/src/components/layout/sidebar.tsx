import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Upload,
  Search,
  AlertTriangle,
  Brain,
  BarChart3,
  History,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload Transactions", href: "/upload", icon: Upload },
  { name: "Transaction Monitor", href: "/monitor", icon: Search },
  { name: "Alert Queue", href: "/alerts", icon: AlertTriangle, hasAlerts: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
    refetchInterval: 30000,
  });

  const activeAlertCount = (alerts || []).length;

  return (
    <aside className="sticky top-16 h-[calc(100vh-80px)] w-64 overflow-y-auto border-r bg-background p-4">
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
              {item.hasAlerts && activeAlertCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {activeAlertCount > 99 ? "99+" : activeAlertCount}
                </Badge>
              )}
            </Link>
          );
        })}
        
        <div className="mt-4 border-t pt-4">
          <Link
            href="/ml-status"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              location === "/ml-status" ? "bg-primary text-primary-foreground" : "text-foreground"
            )}
          >
            <Brain className="h-5 w-5" />
            <span>ML Model Status</span>
          </Link>
          <Link
            href="/audit"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              location === "/audit" ? "bg-primary text-primary-foreground" : "text-foreground"
            )}
          >
            <History className="h-5 w-5" />
            <span>Audit Trail</span>
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              location === "/settings" ? "bg-primary text-primary-foreground" : "text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

