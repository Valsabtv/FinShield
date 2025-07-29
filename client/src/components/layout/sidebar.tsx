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
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.hasAlerts && activeAlertCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {activeAlertCount > 99 ? "99+" : activeAlertCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <Link href="/ml-status">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium cursor-pointer">
              <Brain className="w-5 h-5" />
              <span>ML Model Status</span>
            </div>
          </Link>
          <Link href="/audit">
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium cursor-pointer">
              <History className="w-5 h-5" />
              <span>Audit Trail</span>
            </div>
          </Link>
          <Link href="/settings">
            <a className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
