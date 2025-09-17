import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, wallets } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callbackToken = req.headers.get("x-callback-token");

    if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    if (body.status === "SUCCEEDED" && body.external_id) {
      await db
        .update(transactions)
        .set({ status: "completed", xenditId: body.id })
        .where(eq(transactions.id, body.external_id));

      const trx = await db.query.transactions.findFirst({
        where: eq(transactions.id, body.external_id),
      });

      if (trx && trx.type === "topup" && trx.walletId) {
        await db
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${trx.amount}` })
          .where(eq(wallets.id, trx.walletId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error webhook:", error);
    return NextResponse.json({ error: "Webhook gagal" }, { status: 500 });
  }
}
