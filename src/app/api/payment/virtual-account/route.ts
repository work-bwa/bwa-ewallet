import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { createPaymentRecord } from "@/lib/database-helpers";
import { z } from "zod";

const createVASchema = z.object({
  amount: z.number().min(10000).max(10000000), // Minimal 10rb, maksimal 10jt
  bankCode: z.enum(["BCA", "BNI", "BRI", "MANDIRI"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createVASchema.parse(body);

    // Generate external ID yang unik
    const externalId = `bwa-topup-${session.user.id}-${Date.now()}`;

    // Prepare payload untuk Xendit
    const xenditPayload = {
      external_id: externalId,
      bank_code: validatedData.bankCode,
      name: session.user.name || "BWA User",
      amount: validatedData.amount,
      is_single_use: true,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 jam
    };

    // Call Xendit API untuk create virtual account
    const xenditResponse = await fetch(
      "https://api.xendit.co/callback_virtual_accounts",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.XENDIT_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(xenditPayload),
      }
    );

    const xenditData = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error("Xendit error:", xenditData);
      return NextResponse.json(
        { error: "Failed to create virtual account" },
        { status: 500 }
      );
    }

    // Simpan ke database
    const payment = await createPaymentRecord({
      userId: session.user.id,
      externalId,
      paymentMethod: "va",
      amount: validatedData.amount,
      xenditId: xenditData.id,
      virtualAccountNumber: xenditData.account_number,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        virtualAccount: xenditData.account_number,
        bankCode: validatedData.bankCode,
        amount: validatedData.amount,
        expirationDate: xenditData.expiration_date,
        externalId,
      },
    });
  } catch (error) {
    console.error("VA creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
