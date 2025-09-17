import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
