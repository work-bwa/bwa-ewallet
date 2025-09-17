/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
  Wallet,
  Plus,
  Send,
  History,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";

interface DashboardClientProps {
  userId: string;
  userName?: string;
}

interface Transaction {
  id: number;
  type: "Top Up" | "Transfer" | "Terima";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
  description: string;
  timestamp: string;
}

export function DashboardClient({ userId, userName }: DashboardClientProps) {
  const [saldo, setSaldo] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [animateBalance, setAnimateBalance] = useState(false);
  const [greetingText, setGreetingText] = useState("");

  const router = useRouter();

  // Generate greeting based on time
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const displayName = userName || "User";

    let greeting = "";
    if (hour < 12) {
      greeting = `Selamat pagi, ${displayName}! ☀️`;
    } else if (hour < 17) {
      greeting = `Selamat siang, ${displayName}! 🌤️`;
    } else if (hour < 21) {
      greeting = `Selamat sore, ${displayName}! 🌅`;
    } else {
      greeting = `Selamat malam, ${displayName}! 🌙`;
    }

    setGreetingText(greeting);
    console.log("Greeting set:", greeting); // Debug log
  }, [userName]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Simulate API loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaldo(2750000);
      setTransactions([
        {
          id: 1,
          type: "Top Up",
          amount: 500000,
          status: "Berhasil",
          description: "Top up via Bank BCA",
          timestamp: "2025-01-15 14:30",
        },
        {
          id: 2,
          type: "Transfer",
          amount: 200000,
          status: "Berhasil",
          description: "Transfer ke John Doe",
          timestamp: "2025-01-14 09:20",
        },
        {
          id: 3,
          type: "Terima",
          amount: 150000,
          status: "Berhasil",
          description: "Terima dari Jane Smith",
          timestamp: "2025-01-13 16:45",
        },
        {
          id: 4,
          type: "Transfer",
          amount: 75000,
          status: "Pending",
          description: "Transfer ke Alice Johnson",
          timestamp: "2025-01-13 08:30",
        },
        {
          id: 5,
          type: "Top Up",
          amount: 300000,
          status: "Berhasil",
          description: "Top up via Dana",
          timestamp: "2025-01-12 19:15",
        },
      ]);

      setIsLoading(false);
      setAnimateBalance(true);
    }
    loadData();
  }, [userId]);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await authClient.signOut();
      toast.success("👋 Berhasil logout", {
        description: "Anda telah keluar dari akun. Sampai jumpa!",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("❌ Logout gagal", {
        description: error.message || "Terjadi kesalahan saat logout.",
      });
    } finally {
      setIsLogoutLoading(false);
    }
  };

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

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <div className="transition-all duration-700 translate-y-0 opacity-100">
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mt-1">
                {greetingText}
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Kelola keuangan Anda dengan mudah
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
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
              onClick={handleLogout}
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

      {/* Balance Card */}
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
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
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
          <div
            className={`transition-all duration-500 ${
              animateBalance
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {isBalanceVisible ? (
              <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Rp {isLoading ? "..." : saldo.toLocaleString()}
              </p>
            ) : (
              <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Rp ••••••••
              </p>
            )}
          </div>
          <div className="flex items-center mt-3 space-x-1">
            <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              +12.5%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              dari bulan lalu
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Plus, label: "Top Up", variant: "default" as const },
          { icon: Send, label: "Transfer", variant: "outline" as const },
          { icon: History, label: "Riwayat", variant: "outline" as const },
        ].map((action, index) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-20 flex-col space-y-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Transactions */}
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Transaksi Terakhir
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                5 transaksi terbaru Anda
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
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && transactions.length === 0 && (
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Masuk
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Rp 950.000
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  +15% bulan ini
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <ArrowDownLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Keluar
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Rp 275.000
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  +8% bulan ini
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Transaksi
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  47
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  +23% bulan ini
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <History className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
