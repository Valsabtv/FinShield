import { type User, type InsertUser, type Transaction, type InsertTransaction, type Alert, type InsertAlert, type SystemMetrics, type InsertSystemMetrics, users, transactions, alerts, systemMetrics } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactionsBulk(transactions: InsertTransaction[]): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  
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

  async createTransactionsBulk(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const now = new Date();
    
    for (const insertTransaction of insertTransactions) {
      const id = randomUUID();
      const transaction: Transaction = { 
        ...insertTransaction, 
        id, 
        createdAt: now, 
        updatedAt: now 
      };
      this.transactions.set(id, transaction);
      transactions.push(transaction);
    }
    
    return transactions;
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

export class DatabaseStorage implements IStorage {
  
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async createTransactionsBulk(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    const createdTransactions = await db
      .insert(transactions)
      .values(insertTransactions)
      .returning();
    return createdTransactions;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.createdAt));
  }

  // Alert methods
  async getAlert(id: string): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert || undefined;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const updateData = { ...updates };
    if (updates.status === "RESOLVED" && !updates.resolvedAt) {
      updateData.resolvedAt = sql`CURRENT_TIMESTAMP`;
    }

    const [alert] = await db
      .update(alerts)
      .set(updateData)
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }

  async getAlerts(limit = 50, offset = 0): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAlertsByPriority(priority: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.priority, priority))
      .orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.status, "ACTIVE"))
      .orderBy(desc(alerts.createdAt));
  }

  // System metrics methods
  async createSystemMetric(insertSystemMetric: InsertSystemMetrics): Promise<SystemMetrics> {
    const [systemMetric] = await db
      .insert(systemMetrics)
      .values(insertSystemMetric)
      .returning();
    return systemMetric;
  }

  async getSystemMetrics(metricName?: string, limit = 100): Promise<SystemMetrics[]> {
    let query = db.select().from(systemMetrics);

    if (metricName) {
      query = query.where(eq(systemMetrics.metricName, metricName));
    }

    return await query
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit);
  }

  async getLatestSystemMetrics(): Promise<SystemMetrics[]> {
    // Get distinct metric names first
    const distinctMetrics = await db
      .selectDistinct({ metricName: systemMetrics.metricName })
      .from(systemMetrics);

    const latestMetrics: SystemMetrics[] = [];

    for (const metric of distinctMetrics) {
      const [latestMetric] = await db
        .select()
        .from(systemMetrics)
        .where(eq(systemMetrics.metricName, metric.metricName))
        .orderBy(desc(systemMetrics.timestamp))
        .limit(1);

      if (latestMetric) {
        latestMetrics.push(latestMetric);
      }
    }

    return latestMetrics;
  }
}

export const storage = new DatabaseStorage();
