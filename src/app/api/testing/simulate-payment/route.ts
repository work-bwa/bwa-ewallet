import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { XenditTesting } from "@/lib/xendit-testing";
import { getPaymentByExternalId } from "@/lib/database-helpers";
import { z } from "zod";

const simulateSchema = z.object({
  externalId: z.string(),
  amount: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Only allow in development/test mode
    // if (process.env.NODE_ENV === "production") {
    //   return NextResponse.json(
    //     { error: "Testing not allowed in production" },
    //     { status: 403 }
    //   );
    // }

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { externalId, amount } = simulateSchema.parse(body);

    // Verify payment exists in database
    const payment = await getPaymentByExternalId(externalId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Initialize testing client
    const xenditTesting = new XenditTesting(process.env.XENDIT_SECRET_KEY!);

    // Simulate payment
    const result = await xenditTesting.simulatePayment({ externalId, amount });

    return NextResponse.json({
      success: true,
      simulation: result,
      message: "Payment simulation completed",
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
