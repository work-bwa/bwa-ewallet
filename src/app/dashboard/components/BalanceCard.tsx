import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  isBalanceVisible: boolean;
  isLoading: boolean;
  onToggleVisibility: () => void;
}

export function BalanceCard({
  balance,
  isBalanceVisible,
  isLoading,
  onToggleVisibility,
}: BalanceCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Wallet className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Saldo E-Wallet
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isBalanceVisible ? (
              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="transition-all duration-500">
          {isBalanceVisible ? (
            <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Rp {isLoading ? "..." : balance.toLocaleString()}
            </p>
          ) : (
            <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Rp ••••••••
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
