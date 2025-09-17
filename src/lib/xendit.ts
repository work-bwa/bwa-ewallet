const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
const XENDIT_BASE_URL = "https://api.xendit.co";

export const xenditConfig = {
  secretKey: XENDIT_SECRET_KEY,
  baseUrl: XENDIT_BASE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString(
      "base64"
    )}`,
    "Content-Type": "application/json",
  },
};

// Test connectivity function
export async function testXenditConnection() {
  try {
    const response = await fetch(`${XENDIT_BASE_URL}/balance`, {
      method: "GET",
      headers: xenditConfig.headers,
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
