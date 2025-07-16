// FUTURE FEATURE: Folder monitoring for automatic document processing
// This is scaffolded and commented out for future implementation

import fs from "fs";
import path from "path";
import { processDocument } from "./documentProcessor";
import { convertTextToStructuredJson } from "./openai";
import { storage } from "../storage";
import { saveJsonToFile, generateFilename } from "../utils/fileUtils";
import { config } from "../config";

/*
// Folder monitoring service (scaffolded for future implementation)
export class FolderMonitor {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private processingQueue: Set<string> = new Set();

  // Start monitoring a folder for new files
  public startMonitoring(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder does not exist: ${folderPath}`);
    }

    if (this.watchers.has(folderPath)) {
      console.log(`Already monitoring folder: ${folderPath}`);
      return;
    }

    const watcher = fs.watch(folderPath, (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        this.handleFileEvent(folderPath, filename);
      }
    });

    this.watchers.set(folderPath, watcher);
    console.log(`Started monitoring folder: ${folderPath}`);
  }

  // Stop monitoring a folder
  public stopMonitoring(folderPath: string): void {
    const watcher = this.watchers.get(folderPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(folderPath);
      console.log(`Stopped monitoring folder: ${folderPath}`);
    }
  }

  // Handle file events
  private async handleFileEvent(folderPath: string, filename: string): Promise<void> {
    const fullPath = path.join(folderPath, filename);
    
    // Skip if already processing
    if (this.processingQueue.has(fullPath)) {
      return;
    }

    // Check if file exists and is a supported type
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return;
    }

    // Check file type
    const fileType = this.getFileType(filename);
    if (!config.fileProcessing.allowedTypes.includes(fileType)) {
      return;
    }

    // Add to processing queue
    this.processingQueue.add(fullPath);

    try {
      await this.processFile(fullPath, filename, fileType);
    } catch (error) {
      console.error(`Error processing file ${filename}:`, error);
    } finally {
      this.processingQueue.delete(fullPath);
    }
  }

  // Process a discovered file
  private async processFile(filePath: string, filename: string, fileType: string): Promise<void> {
    console.log(`Auto-processing file: ${filename}`);

    // Create conversion record
    const conversion = await storage.createConversion({
      filename: filename,
      originalName: filename,
      fileType: fileType,
      fileSize: fs.statSync(filePath).size,
      status: "processing",
      jsonOutput: null,
      errorMessage: null,
      processingTime: null,
      confidence: null,
      outputFilePath: null,
    });

    try {
      // Extract text from document
      const extractionResult = await processDocument(filePath, fileType);
      
      // Convert text to structured JSON
      const jsonOutput = await convertTextToStructuredJson(
        extractionResult.text,
        "auto-detect",
        "fast"
      );

      // Save JSON to file
      const outputFilename = generateFilename(filename, conversion.id);
      const outputFilePath = saveJsonToFile(jsonOutput, outputFilename);

      // Update conversion with results
      await storage.updateConversion(conversion.id, {
        status: "completed",
        jsonOutput,
        processingTime: Math.round(jsonOutput.metadata?.processing_time || 0),
        confidence: jsonOutput.metadata?.confidence?.toString() || "0.7",
        outputFilePath,
        completedAt: new Date(),
      });

      console.log(`Successfully processed file: ${filename}`);
    } catch (error: any) {
      await storage.updateConversion(conversion.id, {
        status: "failed",
        errorMessage: error.message,
        completedAt: new Date(),
      });

      console.error(`Failed to process file ${filename}:`, error);
    }
  }

  // Get file type from filename
  private getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'unknown';
    }
  }

  // Stop all monitoring
  public stopAll(): void {
    for (const [folderPath, watcher] of this.watchers) {
      watcher.close();
      console.log(`Stopped monitoring folder: ${folderPath}`);
    }
    this.watchers.clear();
  }
}

// Export singleton instance
export const folderMonitor = new FolderMonitor();

// Example usage (commented out):
// folderMonitor.startMonitoring('./watch-folder');
// folderMonitor.stopMonitoring('./watch-folder');
*/

// Placeholder exports for future implementation
export const folderMonitor = {
  // startMonitoring: (folderPath: string) => { console.log('Folder monitoring not implemented yet'); },
  // stopMonitoring: (folderPath: string) => { console.log('Folder monitoring not implemented yet'); },
  // stopAll: () => { console.log('Folder monitoring not implemented yet'); }
};