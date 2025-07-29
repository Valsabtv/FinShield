import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { storage } from "./storage";
import { insertTransactionSchema, csvTransactionSchema, singleTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

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
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        console.error("Failed to create transaction:", error);
        res.status(500).json({ message: "Failed to create transaction", error: error.message });
      }
    }
  });

  // CSV Upload route
  app.post("/api/transactions/upload-csv", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const csvData: any[] = [];
      const stream = Readable.from(req.file.buffer.toString());
      
      const processingPromise = new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => csvData.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      await processingPromise;

      // Validate and process CSV data
      const processedTransactions = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        try {
          // Validate the CSV row
          const validatedRow = csvTransactionSchema.parse(row);
          
          const transactionData = {
            transactionId: validatedRow.transactionId,
            accountId: validatedRow.accountId,
            amount: validatedRow.amount,
            currency: validatedRow.currency,
            transactionType: validatedRow.transactionType,
            merchantName: validatedRow.merchantName || null,
            merchantCategory: validatedRow.merchantCategory || null,
            location: validatedRow.location || null,
            deviceId: validatedRow.deviceId || null,
            ipAddress: validatedRow.ipAddress || null,
            timestamp: validatedRow.timestamp,
          };

          processedTransactions.push(transactionData);

        } catch (error) {
          errors.push({
            row: i + 1,
            data: row,
            error: error instanceof Error ? error.message : "Validation failed"
          });
        }
      }

      // Bulk insert processed transactions
      if (processedTransactions.length > 0) {
        await storage.createTransactionsBulk(processedTransactions);
      }

      res.json({
        message: "CSV processing completed",
        summary: {
          totalRows: csvData.length,
          processed: processedTransactions.length,
          errors: errors.length,
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors
      });

    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ 
        message: "Failed to process CSV file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Single transaction upload route
  app.post("/api/transactions/single", async (req, res) => {
    try {
      const validatedData = singleTransactionSchema.parse(req.body);
      
      const transactionData = {
        ...validatedData,
        timestamp: validatedData.timestamp,
      };
      
      const transaction = await storage.createTransaction(transactionData);
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

