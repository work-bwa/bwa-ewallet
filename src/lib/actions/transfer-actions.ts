"use server";

import { db } from "@/db";
import { wallets, transactions, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

interface TransferData {
  recipientEmail: string;
  amount: number;
  description: string;
  pin: string;
}

export async function transferToUser(data: TransferData) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized - silakan login kembali" };
    }

    // Validasi PIN (untuk demo, hardcode 123456)
    if (data.pin !== "123456") {
      return { success: false, error: "PIN salah. Untuk demo gunakan: 123456" };
    }

    // Cari user penerima berdasarkan email
    const recipient = await db.query.user.findFirst({
      where: eq(user.email, data.recipientEmail),
    });

    if (!recipient) {
      return { success: false, error: "User penerima tidak ditemukan" };
    }

    if (recipient.id === session.user.id) {
      return { success: false, error: "Tidak bisa transfer ke diri sendiri" };
    }

    // Get wallet pengirim dan penerima
    const senderWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.user.id),
    });

    const recipientWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, recipient.id),
    });

    if (!senderWallet) {
      return { success: false, error: "Wallet pengirim tidak ditemukan" };
    }

    if (!recipientWallet) {
      return { success: false, error: "Wallet penerima tidak ditemukan" };
    }

    // Validasi saldo mencukupi
    if (senderWallet.balance < data.amount) {
      return {
        success: false,
        error: `Saldo tidak mencukupi. Saldo saat ini: Rp ${senderWallet.balance.toLocaleString()}`,
      };
    }

    // Validasi amount
    if (data.amount < 1000) {
      return { success: false, error: "Minimal transfer Rp 1.000" };
    }

    if (data.amount > 5000000) {
      return {
        success: false,
        error: "Maksimal transfer Rp 5.000.000 per transaksi",
      };
    }

    // Eksekusi transfer dalam database transaction
    await db.transaction(async (tx) => {
      // Kurangi saldo pengirim
      await tx
        .update(wallets)
        .set({ balance: senderWallet.balance - data.amount })
        .where(eq(wallets.id, senderWallet.id));

      // Tambah saldo penerima
      await tx
        .update(wallets)
        .set({ balance: recipientWallet.balance + data.amount })
        .where(eq(wallets.id, recipientWallet.id));

      // Buat record transaksi untuk pengirim (keluar)
      await tx.insert(transactions).values({
        walletId: senderWallet.id,
        amount: -data.amount, // Negative amount untuk pengeluaran
        type: "transfer_out",
        description: `Transfer ke ${data.recipientEmail}: ${data.description}`,
      });

      // Buat record transaksi untuk penerima (masuk)
      await tx.insert(transactions).values({
        walletId: recipientWallet.id,
        amount: data.amount, // Positive amount untuk pemasukan
        type: "transfer_in",
        description: `Transfer dari ${session.user.email}: ${data.description}`,
      });
    });

    // Revalidate cache untuk kedua user
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Transfer Rp ${data.amount.toLocaleString()} berhasil dikirim ke ${
        data.recipientEmail
      }`,
    };
  } catch (error) {
    console.error("Transfer error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem. Silakan coba lagi.",
    };
  }
}
