interface SimulatePaymentOptions {
  externalId: string;
  amount: number;
}

interface SimulatePaymentResponse {
  status: "COMPLETED" | "FAILED";
  message: string;
}

export class XenditTesting {
  private secretKey: string;
  private baseUrl: string = "https://api.xendit.co";

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(this.secretKey + ":").toString("base64")}`;
  }

  async simulatePayment({
    externalId,
    amount,
  }: SimulatePaymentOptions): Promise<SimulatePaymentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/callback_virtual_accounts/external_id=${externalId}/simulate_payment`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Simulation failed: ${data.message || "Unknown error"}`
        );
      }

      return data;
    } catch (error) {
      console.error("Payment simulation error:", error);
      throw error;
    }
  }

  async simulatePoolVAPayment(options: {
    bankCode: string;
    accountNumber: string;
    amount: number;
  }): Promise<SimulatePaymentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pool_virtual_accounts/simulate_payment`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bank_code: options.bankCode,
            bank_account_number: options.accountNumber,
            transfer_amount: options.amount,
          }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Pool VA simulation error:", error);
      throw error;
    }
  }
}
