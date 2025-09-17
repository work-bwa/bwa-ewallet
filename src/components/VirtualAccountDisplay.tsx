"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { VirtualAccountData } from "./TopUpForm";
import {
  checkPaymentStatus,
  getWalletBalance,
} from "@/lib/actions/payment-actions";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface VirtualAccountDisplayProps {
  data: VirtualAccountData;
  onBack: () => void;
  userId: string;
}

type PaymentStatus = "pending" | "paid" | "expired" | "failed";

export function VirtualAccountDisplay({
  data,
  onBack,
  userId,
}: VirtualAccountDisplayProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const MAX_POLL_ATTEMPTS = 120; // 10 menit dengan interval 5 detik
  const POLL_INTERVAL = 5000; // 5 detik

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor virtual account disalin!");
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch("/api/testing/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: data.externalId,
          amount: data.amount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          "Payment simulation berhasil! Polling akan mendeteksi perubahan status."
        );
        // Polling akan otomatis detect perubahan status
      } else {
        toast.error(result.error || "Simulation gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan saat simulate payment");
    } finally {
      setIsSimulating(false);
    }
  };

  // Calculate time remaining until expiration
  const calculateTimeRemaining = useCallback(() => {
    const expirationTime = new Date(data.expirationDate).getTime();
    const currentTime = new Date().getTime();
    const remaining = Math.max(0, expirationTime - currentTime);
    return Math.floor(remaining / 1000); // Convert to seconds
  }, [data.expirationDate]);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0 && paymentStatus === "pending") {
        setPaymentStatus("expired");
        setIsPolling(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeRemaining, paymentStatus]);

  // Polling untuk check payment status
  const pollPaymentStatus = useCallback(async () => {
    if (!isPolling || paymentStatus !== "pending") return;

    try {
      const result = await checkPaymentStatus(data.externalId);
      setPollCount((prev) => prev + 1);

      if (result.status === "found" && result.payment?.status === "paid") {
        setPaymentStatus("paid");
        setIsPolling(false);

        // Get updated wallet balance
        const balanceResult = await getWalletBalance(userId);
        if (balanceResult.status === "found") {
          setCurrentBalance(balanceResult.balance);
        }

        toast.success("Pembayaran berhasil! Saldo sudah bertambah.");
        return;
      }

      // Stop polling jika sudah mencapai max attempts
      if (pollCount >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        setPaymentStatus("expired");
        toast.warning("Timeout checking payment status");
      }
    } catch (error) {
      console.error("Polling error:", error);

      // Jika error berulang kali, stop polling
      if (pollCount >= 5) {
        setIsPolling(false);
        toast.error("Terjadi kesalahan saat mengecek status pembayaran");
      }
    }
  }, [isPolling, paymentStatus, data.externalId, userId, pollCount]);

  // Start polling when component mounts
  useEffect(() => {
    if (paymentStatus === "pending") {
      const interval = setInterval(pollPaymentStatus, POLL_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [pollPaymentStatus, paymentStatus]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "pending":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Menunggu Pembayaran
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            Pembayaran Berhasil
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800">
            Virtual Account Kadaluarsa
          </Badge>
        );
      default:
        return <Badge variant="outline">Status Tidak Diketahui</Badge>;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Virtual Account</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Success Message */}
        {paymentStatus === "paid" && currentBalance !== null && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">
              Pembayaran Berhasil!
            </h4>
            <p className="text-sm text-green-800">
              Saldo Anda sekarang:{" "}
              <strong>Rp {currentBalance.toLocaleString()}</strong>
            </p>
          </div>
        )}

        {/* Expired Message */}
        {paymentStatus === "expired" && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">
              Virtual Account Kadaluarsa
            </h4>
            <p className="text-sm text-red-800">
              Silakan buat virtual account baru untuk melanjutkan pembayaran
            </p>
          </div>
        )}

        {/* Virtual Account Details */}
        {paymentStatus !== "expired" && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Transfer ke Bank {data.bankCode}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono">{data.virtualAccount}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(data.virtualAccount)}
                disabled={paymentStatus === "paid"}
              >
                Salin
              </Button>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Jumlah Transfer</span>
            <span className="font-semibold">
              Rp {data.amount.toLocaleString("id-ID")}
            </span>
          </div>

          {timeRemaining !== null && paymentStatus === "pending" && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sisa Waktu</span>
              <span className="font-semibold text-orange-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {paymentStatus === "pending" && (
            <div className="flex justify-between">
              <span className="text-gray-600">Status Pengecekan</span>
              <span className="text-sm text-blue-600">
                {isPolling
                  ? `Mengecek... (${pollCount}/${MAX_POLL_ATTEMPTS})`
                  : "Berhenti"}
              </span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {paymentStatus === "pending" && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Petunjuk:</strong> Transfer tepat sesuai nominal yang
              tertera. Status pembayaran akan terupdate otomatis setelah
              transfer berhasil.
            </p>
          </div>
        )}

        {/* Development Testing Section */}
        {paymentStatus === "pending" && (
          <div className="bg-gray-50 p-4 rounded-lg border-dashed border-2 border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">
              Development Testing
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Simulate payment untuk testing tanpa transfer sungguhan
            </p>
            <Button
              variant="secondary"
              onClick={handleSimulatePayment}
              disabled={isSimulating || isPolling}
              className="w-full"
            >
              {isSimulating ? "Simulating Payment..." : "Simulate Payment"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Hanya tersedia dalam development mode
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {paymentStatus === "paid" && (
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Kembali ke Dashboard
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            disabled={paymentStatus === "pending" && isPolling}
          >
            {paymentStatus === "expired"
              ? "Buat Virtual Account Baru"
              : "Kembali"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
