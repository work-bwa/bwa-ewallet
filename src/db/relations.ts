// src/db/relations.ts
import { relations } from "drizzle-orm";
import { user } from "@/lib/auth-schema";
import { wallets, transactions } from "./schema";

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(user, { fields: [wallets.userId], references: [user.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));
