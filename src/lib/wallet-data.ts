import { db } from "@/db";
import { wallets, transactions, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getWalletData(userId: string) {
  // Get wallet data
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Get recent transactions dari tabel transactions
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.walletId, wallet.id),
    orderBy: [desc(transactions.createdAt)],
    limit: 5,
  });

  // Get recent payments yang sudah berhasil
  const recentPayments = await db.query.payments.findMany({
    where: eq(payments.userId, userId),
    orderBy: [desc(payments.createdAt)],
    limit: 5,
  });

  // Gabungkan dan format data transaksi
  const allTransactions = [
    // Format transaksi manual
    ...recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type === "topup" ? ("Top Up" as const) : ("Transfer" as const),
      amount: tx.amount,
      status: "Berhasil" as const,
      description: tx.description || "",
      timestamp: tx.createdAt.toLocaleString("id-ID"),
    })),
    // Format payment yang sudah sukses
    ...recentPayments
      .filter((payment) => payment.status === "paid")
      .map((payment) => ({
        id: payment.id,
        type: "Top Up" as const,
        amount: payment.amount,
        status: "Berhasil" as const,
        description: `Top up via ${payment.paymentMethod}`,
        timestamp: payment.paidAt?.toLocaleString("id-ID") || "",
      })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    balance: wallet.balance,
    transactions: allTransactions.slice(0, 5), // Ambil 5 transaksi terbaru
  };
}
