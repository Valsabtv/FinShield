import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: text("transaction_id").notNull().unique(),
  accountId: text("account_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  merchantName: text("merchant_name"),
  merchantCategory: text("merchant_category"),
  location: text("location"),
  deviceId: text("device_id"),
  ipAddress: text("ip_address"),
  transactionType: text("transaction_type"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id),
  alertType: text("alert_type").notNull(), // RULE_BASED, ML_BASED, COMBINED
  priority: text("priority").notNull(), // HIGH, MEDIUM, LOW
  description: text("description").notNull(),
  details: jsonb("details"),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, RESOLVED, DISMISSED
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: timestamp("resolved_at")
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 10, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

// Schema for CSV upload validation
export const csvTransactionSchema = z.object({
  transactionId: z.string().min(1),
  accountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  transactionType: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"]),
  merchantName: z.string().optional(),
  merchantCategory: z.string().optional(),
  location: z.string().optional(),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().transform((str) => new Date(str)),
});

// Schema for single transaction input - simplified for frontend form
export const singleTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  accountId: z.string().min(1, "Account ID is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  transactionType: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"]),
  merchantName: z.string().optional(),
  merchantCategory: z.string().optional(),
  location: z.string().optional(),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type CsvTransaction = z.infer<typeof csvTransactionSchema>;
export type SingleTransaction = z.infer<typeof singleTransactionSchema>;
