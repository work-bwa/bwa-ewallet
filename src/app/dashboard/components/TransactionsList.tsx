import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ChevronRight,
  ArrowDownLeft,
  Send,
  ArrowUpRight,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "Top Up" | "Transfer" | "Terima";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
  description: string;
  timestamp: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionsList({
  transactions,
  isLoading,
}: TransactionsListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Top Up":
        return (
          <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );
      case "Transfer":
        return <Send className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "Terima":
        return (
          <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );
      default:
        return (
          <ArrowUpRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Berhasil":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200">
            Berhasil
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200">
            Pending
          </Badge>
        );
      case "Gagal":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
            Gagal
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = amount.toLocaleString();
    if (type === "Top Up" || type === "Terima") {
      return `+Rp ${formatted}`;
    }
    return `-Rp ${formatted}`;
  };

  return (
    <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Transaksi Terakhir
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              {transactions.length} transaksi terbaru
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {tx.type}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {tx.timestamp}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      tx.type === "Top Up" || tx.type === "Terima"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Belum ada transaksi
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Transaksi Anda akan muncul di sini
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
