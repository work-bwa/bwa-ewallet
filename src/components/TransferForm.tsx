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
import { transferToUser } from "@/lib/actions/transfer-actions";
import { Loader2, Send, User, Banknote } from "lucide-react";

const transferSchema = z.object({
  recipientEmail: z.string().email("Email penerima tidak valid"),
  amount: z.string().min(1, "Jumlah transfer harus diisi"),
  description: z
    .string()
    .min(5, "Deskripsi minimal 5 karakter")
    .max(100, "Deskripsi maksimal 100 karakter"),
  pin: z.string().length(6, "PIN harus 6 digit"),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  currentBalance: number;
  userEmail: string;
}

export function TransferForm({ currentBalance, userEmail }: TransferFormProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientEmail: "",
      amount: "",
      description: "",
      pin: "",
    },
  });

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number) || 0);
  };

  const validateTransfer = (data: TransferFormData): string | null => {
    const amount = parseInt(data.amount.replace(/[^0-9]/g, ""));

    if (amount < 1000) {
      return "Minimal transfer Rp 1.000";
    }

    if (amount > 5000000) {
      return "Maksimal transfer Rp 5.000.000 per transaksi";
    }

    if (amount > currentBalance) {
      return "Saldo tidak mencukupi untuk transfer ini";
    }

    if (data.recipientEmail === userEmail) {
      return "Tidak bisa transfer ke diri sendiri";
    }

    return null;
  };

  const onSubmit = async (data: TransferFormData) => {
    const validationError = validateTransfer(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const amount = parseInt(data.amount.replace(/[^0-9]/g, ""));

    setIsTransferring(true);
    try {
      const result = await transferToUser({
        recipientEmail: data.recipientEmail,
        amount,
        description: data.description,
        pin: data.pin,
      });

      if (result.success) {
        toast.success("Transfer berhasil dikirim!");
        setTransferSuccess(true);
        reset();
      } else {
        toast.error(result.error || "Transfer gagal");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat transfer");
    } finally {
      setIsTransferring(false);
    }
  };

  if (transferSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Send className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Transfer Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Transfer sudah dikirim dan saldo penerima akan terupdate secara
            otomatis.
          </p>
          <Button className="w-full" onClick={() => setTransferSuccess(false)}>
            Transfer Lagi
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Kembali ke Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Transfer ke User</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Saldo tersedia: <strong>Rp {currentBalance.toLocaleString()}</strong>
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label
              htmlFor="recipientEmail"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Email Penerima</span>
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="contoh@email.com"
              {...register("recipientEmail")}
              disabled={isTransferring}
            />
            {errors.recipientEmail && (
              <p className="text-red-500 text-sm mt-1">
                {errors.recipientEmail.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="flex items-center space-x-2">
              <Banknote className="h-4 w-4" />
              <span>Jumlah Transfer</span>
            </Label>
            <Input
              id="amount"
              placeholder="Masukkan jumlah"
              {...register("amount")}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                e.target.value = formatted;
              }}
              disabled={isTransferring}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Min: Rp 1.000 | Max: Rp 5.000.000
            </p>
          </div>

          <div>
            <Label htmlFor="description">Keterangan Transfer</Label>
            <Input
              id="description"
              placeholder="Bayar makan siang, dll"
              {...register("description")}
              disabled={isTransferring}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="pin">PIN Transaksi (6 digit)</Label>
            <Input
              id="pin"
              type="password"
              placeholder="••••••"
              maxLength={6}
              {...register("pin")}
              disabled={isTransferring}
            />
            {errors.pin && (
              <p className="text-red-500 text-sm mt-1">{errors.pin.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Untuk demo, gunakan PIN: 123456
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Peringatan:</strong> Pastikan email penerima sudah benar.
              Transfer yang sudah terkirim tidak bisa dibatalkan.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isTransferring}>
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses Transfer...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Transfer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
