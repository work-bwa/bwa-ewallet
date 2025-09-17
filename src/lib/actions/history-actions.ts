"use server";

import { db } from "@/db";
import { transactions, wallets, payments } from "@/db/schema";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";
import { getServerSession } from "@/lib/get-session";

export interface TransactionDetail {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: Date;
  status?: string;
  reference?: string;
}

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  transactionType?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactionHistory(filters: HistoryFilters = {}) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    // Get user wallet
    const userWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.user.id),
    });

    if (!userWallet) {
      return { success: false, error: "Wallet not found", data: [] };
    }

    // Build where conditions
    const conditions = [eq(transactions.walletId, userWallet.id)];

    if (filters.startDate) {
      conditions.push(gte(transactions.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(transactions.createdAt, filters.endDate));
    }

    if (filters.transactionType && filters.transactionType !== "all") {
      conditions.push(eq(transactions.type, filters.transactionType));
    }

    if (filters.searchQuery) {
      conditions.push(
        or(
          like(transactions.description, `%${filters.searchQuery}%`),
          like(transactions.type, `%${filters.searchQuery}%`)
        )
      );
    }

    // Query transactions
    const transactionList = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Get payment details untuk transaksi topup
    const paymentDetails = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, session.user.id));

    // Combine data dan format
    const formattedTransactions: TransactionDetail[] = transactionList.map(
      (tx) => {
        // Cari payment detail jika type topup
        const paymentDetail =
          tx.type === "topup"
            ? paymentDetails.find((p) => p.amount === Math.abs(tx.amount))
            : null;

        return {
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description || "Tidak ada deskripsi",
          createdAt: tx.createdAt,
          status: paymentDetail?.status || "completed",
          reference: paymentDetail?.externalId || tx.id,
        };
      }
    );

    return {
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length,
    };
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return {
      success: false,
      error: "Failed to fetch transaction history",
      data: [],
    };
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized", data: null };
    }

    const userWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.user.id),
    });

    if (!userWallet) {
      return { success: false, error: "Wallet not found", data: null };
    }

    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.walletId, userWallet.id)
      ),
    });

    if (!transaction) {
      return { success: false, error: "Transaction not found", data: null };
    }

    return {
      success: true,
      data: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt,
        reference: transaction.id,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction detail:", error);
    return {
      success: false,
      error: "Failed to fetch transaction detail",
      data: null,
    };
  }
}
