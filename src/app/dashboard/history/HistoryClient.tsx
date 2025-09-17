"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  Receipt,
  Calendar,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTransactionHistory,
  TransactionDetail,
} from "@/lib/actions/history-actions";
import { TransactionReceipt } from "@/components/TransactionReceipt";

interface HistoryClientProps {
  userEmail: string;
}

export function HistoryClient({ userEmail }: HistoryClientProps) {
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showReceipt, setShowReceipt] = useState<TransactionDetail | null>(
    null
  );

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const filters = {
        searchQuery: searchQuery || undefined,
        transactionType: selectedType !== "all" ? selectedType : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: 100,
      };

      const result = await getTransactionHistory(filters);
      if (result.success) {
        setTransactions(result.data);
      } else {
        toast.error(result.error || "Gagal memuat riwayat transaksi");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    loadTransactions();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const csvContent = [
      "Date,Type,Amount,Description,Status,Reference",
      ...transactions.map(
        (tx) =>
          `"${tx.createdAt.toLocaleString("id-ID")}","${tx.type}","${
            tx.amount
          }","${tx.description}","${tx.status}","${tx.reference}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bwa-ewallet-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Data berhasil diexport!");
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount >= 0;
    const formattedAmount = Math.abs(amount).toLocaleString();
    return `${isPositive ? "+" : "-"}Rp ${formattedAmount}`;
  };

  const getTransactionTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      topup: "Top Up",
      transfer_out: "Transfer Keluar",
      transfer_in: "Transfer Masuk",
      payment: "Pembayaran",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Transaksi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari Transaksi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Tipe Transaksi</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Transaksi</SelectItem>
                  <SelectItem value="topup">Top Up</SelectItem>
                  <SelectItem value="transfer_out">Transfer Keluar</SelectItem>
                  <SelectItem value="transfer_in">Transfer Masuk</SelectItem>
                  <SelectItem value="payment">Pembayaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Dari Tanggal</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Sampai Tanggal</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleFilter} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Filter
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-5 w-5" />
              <span>Daftar Transaksi</span>
            </div>
            <Badge variant="secondary">{transactions.length} transaksi</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Memuat transaksi...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada transaksi yang ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">
                        {getTransactionTypeText(transaction.type)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transaction.createdAt.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatAmount(transaction.amount)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReceipt(transaction)}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {showReceipt && (
        <TransactionReceipt
          transaction={showReceipt}
          userEmail={userEmail}
          onClose={() => setShowReceipt(null)}
        />
      )}
    </div>
  );
}
