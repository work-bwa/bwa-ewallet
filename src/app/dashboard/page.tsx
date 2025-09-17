import { getServerSession } from "@/lib/get-session";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { wallets } from "@/db/schema";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Check dan create wallet jika belum ada
  const existingWallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, session.user.id),
  });

  if (!existingWallet) {
    await db.insert(wallets).values({
      userId: session.user.id,
      balance: 0,
    });
  }

  return (
    <DashboardClient userId={session.user.id} userName={session.user.name} />
  );
}
