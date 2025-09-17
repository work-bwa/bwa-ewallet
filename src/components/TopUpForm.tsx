"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VirtualAccountDisplay } from "./VirtualAccountDisplay";

const topUpSchema = z.object({
  amount: z.string().min(1, "Amount harus diisi"),
  bankCode: z.enum(["BCA", "BNI", "BRI", "MANDIRI"]),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

export interface VirtualAccountData {
  paymentId: string;
  virtualAccount: string;
  bankCode: string;
  amount: number;
  expirationDate: string;
  externalId: string;
}

export function TopUpForm() {
  const [virtualAccountData, setVirtualAccountData] =
    useState<VirtualAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      bankCode: "BCA",
      amount: "",
    },
  });

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number) || 0);
  };

  const onSubmit = async (data: TopUpFormData) => {
    // Convert amount string to number and validate
    const amount = parseInt(data.amount.replace(/[^0-9]/g, ""));

    if (amount < 10000) {
      toast.error("Minimal top up Rp 10.000");
      return;
    }

    if (amount > 10000000) {
      toast.error("Maksimal top up Rp 10.000.000");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/payment/virtual-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          bankCode: data.bankCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat virtual account");
      }

      setVirtualAccountData(result.data);
      toast.success("Virtual account berhasil dibuat!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (virtualAccountData) {
    return (
      <VirtualAccountDisplay
        data={virtualAccountData}
        onBack={() => setVirtualAccountData(null)}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Top Up Saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Jumlah Top Up</Label>
            <Input
              id="amount"
              placeholder="Masukkan jumlah"
              {...register("amount")}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                e.target.value = formatted;
              }}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bankCode">Pilih Bank</Label>
            <select
              id="bankCode"
              {...register("bankCode")}
              className="w-full p-2 border rounded-md"
            >
              <option value="BCA">BCA</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="MANDIRI">Mandiri</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Membuat Virtual Account..." : "Buat Virtual Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
