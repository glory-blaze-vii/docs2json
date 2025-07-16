// Configuration for the document conversion service
export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    maxTokens: 4000,
    temperature: {
      fast: 0.3,
      accurate: 0.1
    }
  },

  // File Processing Configuration
  fileProcessing: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    uploadsDir: "uploads/",
    outputDir: "outputs/"
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || "0.0.0.0"
  },

  // Processing Configuration
  processing: {
    pollingInterval: 2000, // 2 seconds
    maxRetries: 3,
    timeoutMs: 120000 // 2 minutes
  }
};

// Validation
export function validateConfig() {
  if (!config.openai.apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }
  
  // Create directories if they don't exist
  const fs = require('fs');
  if (!fs.existsSync(config.fileProcessing.uploadsDir)) {
    fs.mkdirSync(config.fileProcessing.uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(config.fileProcessing.outputDir)) {
    fs.mkdirSync(config.fileProcessing.outputDir, { recursive: true });
  }
}