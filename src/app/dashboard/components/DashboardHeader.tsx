import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

interface DashboardHeaderProps {
  greetingText: string;
  isLoading: boolean;
  isLogoutLoading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  greetingText,
  isLoading,
  isLogoutLoading,
  onRefresh,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mt-1">
            {greetingText}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Kelola keuangan Anda dengan mudah
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ModeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="group transition-all duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 transition-transform duration-500 ${
                isLoading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLogoutLoading}
            className="group hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
          >
            {isLogoutLoading ? (
              <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
