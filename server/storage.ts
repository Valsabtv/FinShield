import { type User, type InsertUser, type Transaction, type InsertTransaction, type Alert, type InsertAlert, type SystemMetrics, type InsertSystemMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  getTransactionsByRiskLevel(riskLevel: string): Promise<Transaction[]>;
  getFlaggedTransactions(): Promise<Transaction[]>;
  
  // Alert methods
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;
  getAlerts(limit?: number, offset?: number): Promise<Alert[]>;
  getAlertsByPriority(priority: string): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  
  // System metrics methods
  createSystemMetric(metric: InsertSystemMetrics): Promise<SystemMetrics>;
  getSystemMetrics(metricName?: string, limit?: number): Promise<SystemMetrics[]>;
  getLatestSystemMetrics(): Promise<SystemMetrics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private alerts: Map<string, Alert>;
  private systemMetrics: Map<string, SystemMetrics>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.alerts = new Map();
    this.systemMetrics = new Map();
    
    // Initialize with some system metrics for dashboard
    this.initializeSystemMetrics();
  }
  
  private initializeSystemMetrics() {
    const now = new Date();
    const metrics = [
      { metricName: "transactions_today", metricValue: "47829" },
      { metricName: "flagged_transactions", metricValue: "127" },
      { metricName: "model_accuracy", metricValue: "0.947" },
      { metricName: "avg_detection_time", metricValue: "2.3" },
      { metricName: "precision", metricValue: "0.872" },
      { metricName: "recall", metricValue: "0.928" },
      { metricName: "roc_auc", metricValue: "0.96" },
      { metricName: "false_positive_rate", metricValue: "0.018" }
    ];
    
    metrics.forEach(metric => {
      const id = randomUUID();
      const systemMetric: SystemMetrics = {
        id,
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        timestamp: now
      };
      this.systemMetrics.set(id, systemMetric);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.transactionId === transactionId,
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return allTransactions.slice(offset, offset + limit);
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.accountId === accountId,
    );
  }

  async getTransactionsByRiskLevel(riskLevel: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.riskLevel === riskLevel,
    );
  }

  async getFlaggedTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.status === "FLAGGED" || transaction.alertGenerated === true,
    );
  }

  // Alert methods
  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const now = new Date();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      createdAt: now,
      resolvedAt: null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updates };
    if (updates.status === "RESOLVED" && !updatedAlert.resolvedAt) {
      updatedAlert.resolvedAt = new Date();
    }
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async getAlerts(limit = 50, offset = 0): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return allAlerts.slice(offset, offset + limit);
  }

  async getAlertsByPriority(priority: string): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.priority === priority,
    );
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.status === "ACTIVE",
    );
  }

  // System metrics methods
  async createSystemMetric(insertSystemMetric: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = randomUUID();
    const now = new Date();
    const systemMetric: SystemMetrics = { 
      ...insertSystemMetric, 
      id, 
      timestamp: now 
    };
    this.systemMetrics.set(id, systemMetric);
    return systemMetric;
  }

  async getSystemMetrics(metricName?: string, limit = 100): Promise<SystemMetrics[]> {
    let metrics = Array.from(this.systemMetrics.values());
    
    if (metricName) {
      metrics = metrics.filter(metric => metric.metricName === metricName);
    }
    
    return metrics
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async getLatestSystemMetrics(): Promise<SystemMetrics[]> {
    const metricNames = new Set(
      Array.from(this.systemMetrics.values()).map(m => m.metricName)
    );
    
    const latestMetrics: SystemMetrics[] = [];
    
    for (const metricName of metricNames) {
      const metrics = await this.getSystemMetrics(metricName, 1);
      if (metrics.length > 0) {
        latestMetrics.push(metrics[0]);
      }
    }
    
    return latestMetrics;
  }
}

export const storage = new MemStorage();
