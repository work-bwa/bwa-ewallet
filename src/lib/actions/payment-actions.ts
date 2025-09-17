"use server";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function checkPaymentStatus(externalId: string) {
  try {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.externalId, externalId),
    });

    if (!payment) {
      return { status: "not_found", payment: null };
    }

    return {
      status: "found",
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    return { status: "error", payment: null };
  }
}

export async function getWalletBalance(userId: string) {
  try {
    const wallet = await db.query.wallets.findFirst({
      where: (wallets, { eq }) => eq(wallets.userId, userId),
    });

    if (!wallet) {
      return { status: "not_found", balance: 0 };
    }

    // Revalidate cache supaya data selalu fresh
    revalidatePath("/dashboard");

    return {
      status: "found",
      balance: wallet.balance,
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return { status: "error", balance: 0 };
  }
}
