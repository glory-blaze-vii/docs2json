// Centralized prompt configuration for document processing

export const SYSTEM_PROMPTS = {
  // Standard prompt for document-to-JSON conversion
  DOCUMENT_TO_JSON: `You are a smart assistant that reads documents and returns structured JSON.
Return ONLY valid JSON with the following structure:
{
  "title": "string",
  "summary": "string", 
  "key_points": ["point 1", "point 2", "point 3"],
  "quotes": ["quoted line 1", "quoted line 2"]
}

Rules:
- title: Extract the main title or create a descriptive title
- summary: Provide a concise summary of the document
- key_points: List 3-5 main points or takeaways
- quotes: Include 2-3 notable quotes or important statements from the document
- Return only valid JSON, no additional text or explanations`,

  // FUTURE: Custom schema prompt (scaffolded)
  CUSTOM_SCHEMA: `You are a smart assistant that reads documents and returns structured JSON.
Use the following custom schema: {SCHEMA}
Return ONLY valid JSON that matches the provided schema.`,

  // FUTURE: Table extraction prompt (scaffolded)
  TABLE_EXTRACTION: `You are a smart assistant that extracts tables from documents.
Return ONLY valid JSON with tables in this format:
{
  "tables": [
    {
      "title": "table title",
      "headers": ["col1", "col2", "col3"],
      "rows": [["val1", "val2", "val3"], ["val4", "val5", "val6"]]
    }
  ]
}`,

  // FUTURE: Key-value extraction prompt (scaffolded)
  KEY_VALUE_EXTRACTION: `You are a smart assistant that extracts key-value pairs from documents.
Return ONLY valid JSON with key-value pairs in this format:
{
  "data": {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
  }
}`
};

export const USER_PROMPTS = {
  STANDARD: (text: string) => `Please convert the following text to structured JSON:\n\n${text}`,
  
  // FUTURE: Custom prompts (scaffolded)
  WITH_CONTEXT: (text: string, context: string) => 
    `Context: ${context}\n\nPlease convert the following text to structured JSON:\n\n${text}`,
  
  WITH_LANGUAGE: (text: string, language: string) => 
    `Process this ${language} document and convert to structured JSON:\n\n${text}`
};

export function getSystemPrompt(type: keyof typeof SYSTEM_PROMPTS, customSchema?: string): string {
  let prompt = SYSTEM_PROMPTS[type];
  if (customSchema && type === 'CUSTOM_SCHEMA') {
    prompt = prompt.replace('{SCHEMA}', customSchema);
  }
  return prompt;
}

export function getUserPrompt(type: keyof typeof USER_PROMPTS, text: string, additional?: string): string {
  const promptFunction = USER_PROMPTS[type];
  if (additional) {
    return promptFunction(text, additional);
  }
  return promptFunction(text);
}