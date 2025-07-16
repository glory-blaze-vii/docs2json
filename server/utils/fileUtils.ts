import fs from "fs";
import path from "path";
import { config } from "../config";

// Create directories if they don't exist
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Save JSON output to a file
export function saveJsonToFile(jsonData: any, filename: string): string {
  ensureDirectoryExists(config.fileProcessing.outputDir);
  
  const outputPath = path.join(config.fileProcessing.outputDir, `${filename}.json`);
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  fs.writeFileSync(outputPath, jsonString, 'utf8');
  return outputPath;
}

// Read JSON from file
export function readJsonFromFile(filePath: string): any {
  try {
    const jsonString = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to read JSON file: ${error.message}`);
  }
}

// Generate unique filename
export function generateFilename(originalName: string, conversionId: number): string {
  const baseName = path.parse(originalName).name;
  const timestamp = Date.now();
  return `${baseName}_${conversionId}_${timestamp}`;
}

// Clean up temporary files
export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to cleanup temp file ${filePath}:`, error);
  }
}

// Get file size in a human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if file exists
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Get file stats
export function getFileStats(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

// FUTURE FEATURE: Monitor folder for new files (scaffolded)
/*
export function watchFolder(folderPath: string, callback: (filename: string) => void): fs.FSWatcher {
  // This would monitor a folder for new files and automatically process them
  // Implementation would use fs.watch or chokidar library
  // 
  // const watcher = fs.watch(folderPath, (eventType, filename) => {
  //   if (eventType === 'rename' && filename) {
  //     const fullPath = path.join(folderPath, filename);
  //     if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
  //       callback(filename);
  //     }
  //   }
  // });
  // return watcher;
}
*/