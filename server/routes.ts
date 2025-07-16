import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertConversionSchema, updateConversionSchema } from "@shared/schema";
import { processDocument } from "./services/documentProcessor";
import { convertTextToStructuredJson } from "./services/openai";
import { saveJsonToFile, generateFilename, cleanupTempFile } from "./utils/fileUtils";
import { config } from "./config";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are supported"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all conversions
  app.get("/api/conversions", async (req, res) => {
    try {
      const conversions = await storage.getAllConversions();
      res.json(conversions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversion by ID
  app.get("/api/conversions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversion = await storage.getConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: "Conversion not found" });
      }
      
      res.json(conversion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload and process document
  app.post("/api/conversions", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { outputStructure = "auto-detect", processingMode = "fast" } = req.body;

      // Create conversion record
      const conversion = await storage.createConversion({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        status: "pending",
        jsonOutput: null,
        errorMessage: null,
        processingTime: null,
        confidence: null,
      });

      // Process document asynchronously
      processDocumentAsync(conversion.id, req.file.path, req.file.mimetype, outputStructure, processingMode);

      res.json(conversion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete conversion
  app.delete("/api/conversions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConversion(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download JSON output
  app.get("/api/conversions/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversion = await storage.getConversion(id);
      
      if (!conversion || !conversion.jsonOutput) {
        return res.status(404).json({ error: "Conversion or JSON output not found" });
      }

      // If there's a saved file, serve it directly
      if (conversion.outputFilePath && fs.existsSync(conversion.outputFilePath)) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${conversion.originalName}.json"`);
        res.sendFile(path.resolve(conversion.outputFilePath));
      } else {
        // Fallback to in-memory JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${conversion.originalName}.json"`);
        res.send(JSON.stringify(conversion.jsonOutput, null, 2));
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processDocumentAsync(
  conversionId: number,
  filePath: string,
  fileType: string,
  outputStructure: string,
  processingMode: string
) {
  try {
    // Update status to processing
    await storage.updateConversion(conversionId, { status: "processing" });

    // Get conversion details for filename generation
    const conversion = await storage.getConversion(conversionId);
    if (!conversion) {
      throw new Error("Conversion not found");
    }

    // Extract text from document
    const extractionResult = await processDocument(filePath, fileType);
    
    // Convert text to structured JSON using OpenAI
    const jsonOutput = await convertTextToStructuredJson(
      extractionResult.text,
      outputStructure,
      processingMode
    );

    // Save JSON to file
    const filename = generateFilename(conversion.originalName, conversionId);
    const outputFilePath = saveJsonToFile(jsonOutput, filename);
    
    // Update conversion with results
    await storage.updateConversion(conversionId, {
      status: "completed",
      jsonOutput,
      processingTime: Math.round(jsonOutput.metadata?.processing_time || 0),
      confidence: jsonOutput.metadata?.confidence?.toString() || "0.7",
      outputFilePath,
      completedAt: new Date(),
    });

    // Clean up uploaded file
    cleanupTempFile(filePath);
  } catch (error: any) {
    // Update conversion with error
    await storage.updateConversion(conversionId, {
      status: "failed",
      errorMessage: error.message,
      completedAt: new Date(),
    });

    // Clean up uploaded file
    cleanupTempFile(filePath);
  }
}
