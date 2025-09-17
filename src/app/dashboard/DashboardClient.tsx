"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { DashboardHeader } from "./components/DashboardHeader";
import { BalanceCard } from "./components/BalanceCard";
import { QuickActions } from "./components/QuickActions";
import { TransactionsList } from "./components/TransactionsList";

interface DashboardClientProps {
  userId: string;
  userName?: string;
}

interface Transaction {
  id: string;
  type: "Top Up" | "Transfer" | "Terima";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
  description: string;
  timestamp: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export function DashboardClient({ userId, userName }: DashboardClientProps) {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    transactions: [],
  });
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [greetingText, setGreetingText] = useState("");

  const router = useRouter();

  // Generate greeting berdasarkan waktu
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const displayName = userName || "User";

    let greeting = "";
    if (hour < 12) {
      greeting = `Selamat pagi, ${displayName}!`;
    } else if (hour < 17) {
      greeting = `Selamat siang, ${displayName}!`;
    } else if (hour < 21) {
      greeting = `Selamat sore, ${displayName}!`;
    } else {
      greeting = `Selamat malam, ${displayName}!`;
    }

    setGreetingText(greeting);
  }, [userName]);

  // Load wallet data dari API
  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wallet/data");
      const data = await response.json();

      if (response.ok) {
        setWalletData(data);
      } else {
        console.error("Failed to load wallet data:", data.error);
        toast.error("Gagal memuat data wallet");
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await authClient.signOut();
      toast.success("Berhasil logout");
      router.push("/login");
    } catch {
      toast.error("Logout gagal");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadWalletData();
    toast.success("Data berhasil diperbarui");
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <DashboardHeader
        greetingText={greetingText}
        isLoading={isLoading}
        isLogoutLoading={isLogoutLoading}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />

      <BalanceCard
        balance={walletData.balance}
        isBalanceVisible={isBalanceVisible}
        isLoading={isLoading}
        onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
      />

      <QuickActions />

      <TransactionsList
        transactions={walletData.transactions}
        isLoading={isLoading}
      />
    </div>
  );
}
