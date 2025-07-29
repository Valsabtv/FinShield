import { db } from "./db";
import { systemMetrics } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database with initial system metrics...");
    
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