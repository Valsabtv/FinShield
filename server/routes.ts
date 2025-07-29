import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const transactions = await storage.getTransactions(limit, offset);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  app.get("/api/transactions/flagged", async (req, res) => {
    try {
      const flaggedTransactions = await storage.getFlaggedTransactions();
      res.json(flaggedTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flagged transactions" });
    }
  });
  
  app.get("/api/transactions/risk/:level", async (req, res) => {
    try {
      const { level } = req.params;
      const transactions = await storage.getTransactionsByRiskLevel(level.toUpperCase());
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions by risk level" });
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Apply rule-based pre-filtering
      const ruleBasedResult = await applyRuleBasedFiltering(validatedData);
      
      // Apply ML scoring
      const mlResult = await applyMLScoring({ ...validatedData, ...ruleBasedResult });
      
      // Create transaction with all results
      const transaction = await storage.createTransaction({
        ...validatedData,
        ...ruleBasedResult,
        ...mlResult
      });
      
      // Generate alert if needed
      if (transaction.alertGenerated) {
        await generateAlert(transaction);
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });
  
  app.post("/api/transactions/upload", async (req, res) => {
    try {
      const { transactions } = req.body;
      
      if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: "Expected array of transactions" });
      }
      
      const results = [];
      let alertsGenerated = 0;
      
      for (const txnData of transactions) {
        try {
          const validatedData = insertTransactionSchema.parse(txnData);
          
          // Apply rule-based pre-filtering
          const ruleBasedResult = await applyRuleBasedFiltering(validatedData);
          
          // Apply ML scoring
          const mlResult = await applyMLScoring({ ...validatedData, ...ruleBasedResult });
          
          // Create transaction
          const transaction = await storage.createTransaction({
            ...validatedData,
            ...ruleBasedResult,
            ...mlResult
          });
          
          // Generate alert if needed
          if (transaction.alertGenerated) {
            await generateAlert(transaction);
            alertsGenerated++;
          }
          
          results.push(transaction);
        } catch (error) {
          console.error("Failed to process transaction:", error);
        }
      }
      
      res.json({ 
        processed: results.length, 
        alertsGenerated,
        transactions: results 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process transactions" });
    }
  });
  
  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const alerts = await storage.getAlerts(limit, offset);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });
  
  app.get("/api/alerts/active", async (req, res) => {
    try {
      const activeAlerts = await storage.getActiveAlerts();
      res.json(activeAlerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active alerts" });
    }
  });
  
  app.get("/api/alerts/priority/:priority", async (req, res) => {
    try {
      const { priority } = req.params;
      const alerts = await storage.getAlertsByPriority(priority.toUpperCase());
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts by priority" });
    }
  });
  
  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedAlert = await storage.updateAlert(id, updates);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });
  
  // System metrics routes
  app.get("/api/metrics", async (req, res) => {
    try {
      const metricName = req.query.metricName as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const metrics = await storage.getSystemMetrics(metricName, limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });
  
  app.get("/api/metrics/latest", async (req, res) => {
    try {
      const latestMetrics = await storage.getLatestSystemMetrics();
      res.json(latestMetrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest metrics" });
    }
  });
  
  // Dashboard data endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const latestMetrics = await storage.getLatestSystemMetrics();
      const activeAlerts = await storage.getActiveAlerts();
      const flaggedTransactions = await storage.getFlaggedTransactions();
      const recentTransactions = await storage.getTransactions(10, 0);
      
      // Calculate risk distribution
      const lowRisk = await storage.getTransactionsByRiskLevel("LOW");
      const mediumRisk = await storage.getTransactionsByRiskLevel("MEDIUM");
      const highRisk = await storage.getTransactionsByRiskLevel("HIGH");
      
      const stats = {
        metrics: latestMetrics.reduce((acc, metric) => {
          acc[metric.metricName] = metric.metricValue;
          return acc;
        }, {} as Record<string, string>),
        alertCounts: {
          total: activeAlerts.length,
          high: activeAlerts.filter(a => a.priority === "HIGH").length,
          medium: activeAlerts.filter(a => a.priority === "MEDIUM").length,
          low: activeAlerts.filter(a => a.priority === "LOW").length
        },
        riskDistribution: {
          low: lowRisk.length,
          medium: mediumRisk.length,
          high: highRisk.length
        },
        flaggedTransactions: flaggedTransactions.length,
        recentTransactions: recentTransactions.slice(0, 5)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Rule-based pre-filtering implementation
async function applyRuleBasedFiltering(transaction: any) {
  const amount = parseFloat(transaction.amount);
  const flags: any = {
    highValueFlag: false,
    structuringFlag: false,
    ipMismatchFlag: false,
    geoVelocityFlag: false,
    multipleFailuresFlag: false,
    alertGenerated: false
  };
  
  // High-Value Threshold: amount > $10,000
  if (amount > 10000) {
    flags.highValueFlag = true;
    flags.alertGenerated = true;
  }
  
  // IP Mismatch: billing country ≠ IP country
  if (transaction.billingCountry && transaction.ipCountry && 
      transaction.billingCountry !== transaction.ipCountry) {
    flags.ipMismatchFlag = true;
    flags.alertGenerated = true;
  }
  
  // Geo-Velocity Violation: > 500 km/h
  if (transaction.geoVelocity && parseFloat(transaction.geoVelocity) > 500) {
    flags.geoVelocityFlag = true;
    flags.alertGenerated = true;
  }
  
  // Multiple Failures: > 5 failed payment attempts
  if (transaction.failedAttempts && transaction.failedAttempts > 5) {
    flags.multipleFailuresFlag = true;
    flags.alertGenerated = true;
  }
  
  // Check for structuring pattern (would need to check against existing transactions)
  // For now, implementing a simple check
  if (amount >= 9000 && amount < 10000) {
    // This would require checking other transactions from same account in last 24h
    // For demo purposes, randomly flag some of these
    if (Math.random() < 0.3) {
      flags.structuringFlag = true;
      flags.alertGenerated = true;
    }
  }
  
  return flags;
}

// ML scoring implementation (mock)
async function applyMLScoring(transaction: any) {
  // Mock ML model implementation
  // In production, this would call the actual ML model from the GitHub repo
  
  let mlScore = Math.random(); // Base random score
  
  // Adjust score based on rule-based flags
  if (transaction.highValueFlag) mlScore = Math.max(mlScore, 0.8);
  if (transaction.structuringFlag) mlScore = Math.max(mlScore, 0.9);
  if (transaction.geoVelocityFlag) mlScore = Math.max(mlScore, 0.95);
  if (transaction.ipMismatchFlag) mlScore = Math.max(mlScore, 0.7);
  if (transaction.multipleFailuresFlag) mlScore = Math.max(mlScore, 0.75);
  
  // Feature-based adjustments
  const amount = parseFloat(transaction.amount);
  if (amount > 50000) mlScore += 0.1;
  if (transaction.failedAttempts > 0) mlScore += 0.05 * transaction.failedAttempts;
  
  mlScore = Math.min(mlScore, 1.0); // Cap at 1.0
  
  let riskLevel = "LOW";
  let status = "PROCESSED";
  
  // Risk categorization and status
  if (mlScore > 0.9) {
    riskLevel = "HIGH";
    status = "BLOCKED";
  } else if (mlScore > 0.5) {
    riskLevel = "MEDIUM";
    status = "CHALLENGED";
  }
  
  if (transaction.alertGenerated || mlScore > 0.7) {
    status = "FLAGGED";
  }
  
  // Generate SHAP-style explanation
  const shapExplanation = {
    amount: amount > 10000 ? 0.3 : -0.1,
    velocity: transaction.transactionVelocity > 10 ? 0.4 : 0.0,
    time: transaction.timeOfDay < 6 || transaction.timeOfDay > 22 ? 0.2 : -0.05,
    geo: transaction.geoVelocityFlag ? 0.8 : 0.0,
    device: transaction.failedAttempts > 0 ? 0.1 * transaction.failedAttempts : 0.0,
    identity: !transaction.phoneVerified ? 0.1 : -0.05
  };
  
  return {
    mlScore: mlScore.toFixed(4),
    riskLevel,
    status,
    shapExplanation,
    alertGenerated: transaction.alertGenerated || mlScore > 0.7
  };
}

// Alert generation
async function generateAlert(transaction: any) {
  const alertType = transaction.highValueFlag || transaction.structuringFlag || 
                   transaction.geoVelocityFlag ? "RULE_BASED" : "ML_BASED";
  
  let priority = "LOW";
  let description = "Transaction flagged for review";
  
  const mlScore = parseFloat(transaction.mlScore);
  
  if (mlScore > 0.9 || transaction.geoVelocityFlag || transaction.structuringFlag) {
    priority = "HIGH";
    description = "High-risk transaction detected - immediate review required";
  } else if (mlScore > 0.7 || transaction.highValueFlag) {
    priority = "MEDIUM";
    description = "Medium-risk transaction flagged for review";
  }
  
  if (transaction.structuringFlag) {
    description = "Potential structuring pattern detected";
  } else if (transaction.geoVelocityFlag) {
    description = "Impossible travel pattern detected";
  } else if (transaction.highValueFlag) {
    description = `High-value transaction: $${transaction.amount}`;
  }
  
  const alert = await storage.createAlert({
    transactionId: transaction.id,
    alertType,
    priority,
    description,
    details: {
      mlScore: transaction.mlScore,
      riskLevel: transaction.riskLevel,
      flags: {
        highValue: transaction.highValueFlag,
        structuring: transaction.structuringFlag,
        geoVelocity: transaction.geoVelocityFlag,
        ipMismatch: transaction.ipMismatchFlag,
        multipleFailures: transaction.multipleFailuresFlag
      },
      shapExplanation: transaction.shapExplanation
    },
    status: "ACTIVE"
  });
  
  return alert;
}
