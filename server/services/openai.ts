import OpenAI from "openai";
import { config } from "../config";
import { validateJsonOutput, sanitizeJsonOutput, type StandardJsonOutput } from "../utils/jsonValidator";
import { getSystemPrompt, getUserPrompt } from "../config/prompts";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (config.openai.apiKey) {
  openai = new OpenAI({ 
    apiKey: config.openai.apiKey
  });
}

// Standardized JSON output interface
export interface StructuredJsonOutput extends StandardJsonOutput {
  // Additional metadata for processing
  metadata?: {
    extracted_at: string;
    confidence: number;
    processing_time: number;
  };
}

export async function convertTextToStructuredJson(
  text: string,
  outputStructure: string = "auto-detect",
  processingMode: string = "fast"
): Promise<StructuredJsonOutput> {
  const startTime = Date.now();
  
  // Check if OpenAI client is available
  if (!openai) {
    throw new Error("OpenAI API key is required. Please provide OPENAI_API_KEY environment variable.");
  }
  
  try {
    // Use centralized prompts for consistent output
    const systemPrompt = getSystemPrompt('DOCUMENT_TO_JSON');
    const userPrompt = getUserPrompt('STANDARD', text);

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: config.openai.temperature[processingMode] || config.openai.temperature.fast,
      max_tokens: config.openai.maxTokens,
    });

    const processingTime = (Date.now() - startTime) / 1000;
    const rawResult = JSON.parse(response.choices[0].message.content);
    
    // Validate and sanitize the output
    const validation = validateJsonOutput(rawResult);
    
    let result: StructuredJsonOutput;
    if (validation.isValid && validation.data) {
      result = validation.data;
    } else {
      // If validation fails, sanitize and fix the output
      console.warn("JSON validation failed, sanitizing output:", validation.errors);
      result = sanitizeJsonOutput(rawResult);
    }
    
    // Add metadata
    result.metadata = {
      extracted_at: new Date().toISOString(),
      confidence: validation.isValid ? 0.9 : 0.7, // Lower confidence for sanitized output
      processing_time: processingTime,
    };
    
    return result;
  } catch (error: any) {
    throw new Error(`Failed to convert text to structured JSON: ${error.message}`);
  }
}
