import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { getWalletData } from "@/lib/wallet-data";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const walletData = await getWalletData(session.user.id);
    return NextResponse.json(walletData);
  } catch (error) {
    console.error("Wallet data error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
