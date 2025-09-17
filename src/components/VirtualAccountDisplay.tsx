"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VirtualAccountData } from "./TopUpForm";
import { useState } from "react";

interface VirtualAccountDisplayProps {
  data: VirtualAccountData;
  onBack: () => void;
}

export function VirtualAccountDisplay({
  data,
  onBack,
}: VirtualAccountDisplayProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor virtual account disalin!");
  };

  const formatExpiration = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
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
          "Payment simulation berhasil! Cek dashboard untuk update saldo."
        );
      } else {
        toast.error(result.error || "Simulation gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan saat simulate payment");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Virtual Account Berhasil Dibuat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            >
              Salin
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Jumlah Transfer</span>
            <span className="font-semibold">
              Rp {data.amount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Berlaku Hingga</span>
            <span className="font-semibold">
              {formatExpiration(data.expirationDate)}
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Petunjuk:</strong> Transfer tepat sesuai nominal yang
            tertera. Saldo akan otomatis masuk setelah transfer berhasil.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-50 p-4 rounded-lg border-dashed border-2 border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">Testing Mode</h4>
            <Button
              variant="secondary"
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="w-full"
            >
              {isSimulating ? "Simulating..." : "Simulate Payment"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Hanya tersedia dalam development mode
            </p>
          </div>
        )}

        <Button variant="outline" onClick={onBack} className="w-full">
          Buat Virtual Account Baru
        </Button>
      </CardContent>
    </Card>
  );
}
