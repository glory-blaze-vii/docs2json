import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export interface ProcessingResult {
  text: string;
  pageCount?: number;
  metadata: {
    fileSize: number;
    processingTime: number;
  };
}

export async function extractTextFromPdf(filePath: string): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    const processingTime = (Date.now() - startTime) / 1000;
    const fileStats = fs.statSync(filePath);
    
    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        fileSize: fileStats.size,
        processingTime,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

export async function extractTextFromDocx(filePath: string): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    const processingTime = (Date.now() - startTime) / 1000;
    const fileStats = fs.statSync(filePath);
    
    return {
      text: result.value,
      metadata: {
        fileSize: fileStats.size,
        processingTime,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

export async function processDocument(filePath: string, fileType: string): Promise<ProcessingResult> {
  if (fileType === "application/pdf") {
    return await extractTextFromPdf(filePath);
  } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await extractTextFromDocx(filePath);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
