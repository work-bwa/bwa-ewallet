import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if wallet already exists
    const existingWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.user.id),
    });

    if (existingWallet) {
      return NextResponse.json({ wallet: existingWallet });
    }

    // Create new wallet with 0 balance
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId: session.user.id,
        balance: 0,
      })
      .returning();

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
