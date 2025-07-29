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
  
  // Monetary features
  transactionVelocity: integer("transaction_velocity").default(0),
  avgTicketSize: decimal("avg_ticket_size", { precision: 15, scale: 2 }),
  
  // Temporal features
  timeOfDay: integer("time_of_day"), // hour of day 0-23
  interTransactionInterval: integer("inter_transaction_interval"), // minutes
  dayNightRatio: decimal("day_night_ratio", { precision: 5, scale: 4 }),
  
  // Location & Channel features
  ipAddress: text("ip_address"),
  ipCountry: text("ip_country"),
  billingCountry: text("billing_country"),
  geoVelocity: decimal("geo_velocity", { precision: 10, scale: 2 }), // km/h
  merchantCategory: text("merchant_category"),
  
  // Device & Session features
  deviceFingerprint: text("device_fingerprint"),
  sessionBehavior: jsonb("session_behavior"),
  failedAttempts: integer("failed_attempts").default(0),
  
  // Identity features
  emailAge: integer("email_age"), // days
  emailDomain: text("email_domain"),
  phoneVerified: boolean("phone_verified").default(false),
  socialProfilePresence: boolean("social_profile_presence").default(false),
  
  // ML and Risk Assessment
  mlScore: decimal("ml_score", { precision: 5, scale: 4 }),
  riskLevel: text("risk_level").notNull().default("LOW"), // HIGH, MEDIUM, LOW
  shapExplanation: jsonb("shap_explanation"),
  
  // Rule-based flags
  highValueFlag: boolean("high_value_flag").default(false),
  structuringFlag: boolean("structuring_flag").default(false),
  ipMismatchFlag: boolean("ip_mismatch_flag").default(false),
  geoVelocityFlag: boolean("geo_velocity_flag").default(false),
  multipleFailuresFlag: boolean("multiple_failures_flag").default(false),
  
  // Status and processing
  status: text("status").notNull().default("PROCESSED"), // PROCESSED, FLAGGED, BLOCKED, CHALLENGED
  alertGenerated: boolean("alert_generated").default(false),
  reviewStatus: text("review_status").default("PENDING"), // PENDING, REVIEWED, APPROVED, REJECTED
  
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
  timestamp: z.string().transform((str) => new Date(str).toISOString()),
});

// Schema for single transaction input
export const singleTransactionSchema = insertTransactionSchema.extend({
  timestamp: z.string().transform((str) => new Date(str).toISOString()),
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
