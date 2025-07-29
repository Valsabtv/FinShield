import { Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
    refetchInterval: 30000,
  });

  const activeAlertCount = (alerts || []).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-lg">
              <span className="text-sm font-bold">FS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">FinShield</h1>
            <Badge variant="secondary" className="text-xs">v2.1</Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            {activeAlertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeAlertCount > 9 ? "9+" : activeAlertCount}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40" />
              <AvatarFallback>JH</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">John Harrison</div>
              <div className="text-xs text-muted-foreground">Risk Analyst</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
