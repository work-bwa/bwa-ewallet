import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createPaymentRecord(data: {
  userId: string;
  externalId: string;
  paymentMethod: string;
  amount: number;
  xenditId?: string;
  virtualAccountNumber?: string;
}) {
  const [payment] = await db.insert(payments).values(data).returning();
  return payment;
}

export async function updatePaymentStatus(
  externalId: string,
  updates: { status?: string; xenditId?: string; paidAt?: Date }
) {
  const [updated] = await db
    .update(payments)
    .set(updates)
    .where(eq(payments.externalId, externalId))
    .returning();
  return updated;
}

export async function getPaymentByExternalId(externalId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.externalId, externalId),
  });
  return payment;
}
