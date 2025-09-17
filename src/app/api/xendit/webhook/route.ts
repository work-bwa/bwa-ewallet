import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { payments, wallets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPaymentByExternalId } from "@/lib/database-helpers";

interface XenditWebhookPayload {
  id: string;
  external_id: string;
  account_number: string;
  bank_code: string;
  amount: number;
  transaction_timestamp: string;
  merchant_code: string;
  payment_id: string;
  callback_virtual_account_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const xenditSignature = headersList.get("x-callback-token");

    // Validate webhook signature
    if (
      !xenditSignature ||
      xenditSignature !== process.env.XENDIT_WEBHOOK_TOKEN
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as XenditWebhookPayload;
    console.log("Received webhook:", body);

    // Find payment record in database
    const payment = await getPaymentByExternalId(body.external_id);
    if (!payment) {
      console.error("Payment not found for external_id:", body.external_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if payment already processed
    if (payment.status === "paid") {
      console.log("Payment already processed:", body.external_id);
      return NextResponse.json({ message: "Payment already processed" });
    }

    // Validate amount
    if (body.amount !== payment.amount) {
      console.error("Amount mismatch:", {
        webhook: body.amount,
        database: payment.amount,
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Start transaction to update payment and wallet
    await db.transaction(async (tx) => {
      // Update payment status
      await tx
        .update(payments)
        .set({
          status: "paid",
          paidAt: new Date(body.transaction_timestamp),
        })
        .where(eq(payments.externalId, body.external_id));

      // Get current wallet balance
      const currentWallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, payment.userId),
      });

      if (!currentWallet) {
        throw new Error("Wallet not found for user");
      }

      // Update wallet balance dengan current balance + amount
      await tx
        .update(wallets)
        .set({
          balance: currentWallet.balance + body.amount,
        })
        .where(eq(wallets.userId, payment.userId));

      // Create transaction record
      await tx.insert(transactions).values({
        walletId: currentWallet.id,
        amount: body.amount,
        type: "topup",
        description: `Top up via ${payment.paymentMethod} - ${body.bank_code}`,
      });
    });

    console.log("Payment processed successfully:", body.external_id);
    return NextResponse.json({
      message: "Payment processed successfully",
      external_id: body.external_id,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
