import { db } from "./db";
import { transactions, systemMetrics } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database with example transactions and initial system metrics...");

    const exampleTransactions = [
      {
        transactionId: "TXN001",
        accountId: "ACC001",
        amount: "100.00",
        currency: "USD",
        transactionType: "PAYMENT",
        merchantName: "Amazon",
        merchantCategory: "E-commerce",
        location: "Seattle, WA",
        deviceId: "DEV001",
        ipAddress: "192.168.1.1",
        timestamp: new Date().toISOString(),
      },
      {
        transactionId: "TXN002",
        accountId: "ACC002",
        amount: "500.00",
        currency: "EUR",
        transactionType: "TRANSFER",
        merchantName: "",
        merchantCategory: "",
        location: "Berlin, DE",
        deviceId: "DEV002",
        ipAddress: "192.168.1.2",
        timestamp: new Date().toISOString(),
      },
      {
        transactionId: "TXN003",
        accountId: "ACC001",
        amount: "25.50",
        currency: "USD",
        transactionType: "DEPOSIT",
        merchantName: "Bank",
        merchantCategory: "Finance",
        location: "New York, NY",
        deviceId: "DEV001",
        ipAddress: "192.168.1.1",
        timestamp: new Date().toISOString(),
      },
    ];

    const initialMetrics = [
      { metricName: "transactions_today", metricValue: "47829" },
      { metricName: "flagged_transactions", metricValue: "127" },
      { metricName: "model_accuracy", metricValue: "0.947" },
      { metricName: "avg_detection_time", metricValue: "2.3" },
      { metricName: "precision", metricValue: "0.872" },
      { metricName: "recall", metricValue: "0.928" },
      { metricName: "roc_auc", metricValue: "0.96" },
      { metricName: "false_positive_rate", metricValue: "0.018" }
    ];

    // Check if transactions already exist
    const existingTransactions = await db.select().from(transactions).limit(1);
    if (existingTransactions.length === 0) {
      await db.insert(transactions).values(exampleTransactions);
      console.log("✓ Example transactions seeded successfully");
    } else {
      console.log("✓ Transactions already exist, skipping seed");
    }

    // Check if metrics already exist
    const existingMetrics = await db.select().from(systemMetrics).limit(1);
    if (existingMetrics.length === 0) {
      await db.insert(systemMetrics).values(initialMetrics);
      console.log("✓ Initial system metrics seeded successfully");
    } else {
      console.log("✓ System metrics already exist, skipping seed");
    }

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seedDatabase };