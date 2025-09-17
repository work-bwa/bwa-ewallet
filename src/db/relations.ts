// src/db/relations.ts
import { relations } from "drizzle-orm";
import { user } from "@/lib/auth-schema";
import { wallets, transactions, payments } from "./schema";

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

// New relations for payments
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(user, { fields: [payments.userId], references: [user.id] }),
}));

// Update user relations
export const userRelations = relations(user, ({ one, many }) => ({
  wallet: one(wallets, { fields: [user.id], references: [wallets.userId] }),
  payments: many(payments),
}));
