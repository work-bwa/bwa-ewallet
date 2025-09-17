"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, X } from "lucide-react";
import { TransactionDetail } from "@/lib/actions/history-actions";

interface TransactionReceiptProps {
  transaction: TransactionDetail;
  userEmail: string;
  onClose: () => void;
}

export function TransactionReceipt({
  transaction,
  userEmail,
  onClose,
}: TransactionReceiptProps) {
  const formatAmount = (amount: number) => {
    const isPositive = amount >= 0;
    const formattedAmount = Math.abs(amount).toLocaleString();
    return `${isPositive ? "+" : "-"}Rp ${formattedAmount}`;
  };

  const getTransactionTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      topup: "Top Up Saldo",
      transfer_out: "Transfer Keluar",
      transfer_in: "Transfer Masuk",
      payment: "Pembayaran",
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = `
BWA E-Wallet - Receipt
======================

Transaction ID: ${transaction.id}
Reference: ${transaction.reference}
Date: ${transaction.createdAt.toLocaleString("id-ID")}
Type: ${getTransactionTypeText(transaction.type)}
Amount: ${formatAmount(transaction.amount)}
Status: ${transaction.status}
Description: ${transaction.description}
User: ${userEmail}

Generated on: ${new Date().toLocaleString("id-ID")}
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${transaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between print:border-b">
          <CardTitle className="text-xl">Receipt Transaksi</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="print:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 print:text-sm">
          {/* Header Info */}
          <div className="text-center border-b pb-4">
            <h2 className="text-lg font-bold">BWA E-Wallet</h2>
            <p className="text-sm text-gray-600">Digital Wallet Receipt</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm">
                {transaction.id.slice(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm">
                {transaction.reference?.slice(0, 12)}...
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal:</span>
              <span>{transaction.createdAt.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tipe:</span>
              <span>{getTransactionTypeText(transaction.type)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span
                className={`text-lg font-bold ${
                  transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatAmount(transaction.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <Badge
                className={getStatusColor(transaction.status || "completed")}
              >
                {transaction.status || "completed"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Deskripsi:</span>
              <span className="text-right max-w-48 text-sm">
                {transaction.description}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">User:</span>
              <span className="text-sm">{userEmail}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-gray-500">
            <p>Generated on {new Date().toLocaleString("id-ID")}</p>
            <p>BWA E-Wallet - Powered by Next.js & Xendit</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 print:hidden">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
