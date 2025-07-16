import { z } from "zod";

// Schema for the standardized JSON output format
export const StandardJsonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  key_points: z.array(z.string()).min(1, "At least one key point is required"),
  quotes: z.array(z.string()).min(0, "Quotes must be an array")
});

export type StandardJsonOutput = z.infer<typeof StandardJsonSchema>;

// Validation function
export function validateJsonOutput(jsonOutput: unknown): {
  isValid: boolean;
  data?: StandardJsonOutput;
  errors?: string[];
} {
  try {
    const validatedData = StandardJsonSchema.parse(jsonOutput);
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

// Helper function to check if all required fields are present
export function hasRequiredFields(jsonOutput: any): boolean {
  const requiredFields = ['title', 'summary', 'key_points', 'quotes'];
  return requiredFields.every(field => jsonOutput.hasOwnProperty(field));
}

// Helper function to get missing fields
export function getMissingFields(jsonOutput: any): string[] {
  const requiredFields = ['title', 'summary', 'key_points', 'quotes'];
  return requiredFields.filter(field => !jsonOutput.hasOwnProperty(field));
}

// Helper function to sanitize and fix common issues
export function sanitizeJsonOutput(jsonOutput: any): StandardJsonOutput {
  return {
    title: jsonOutput.title || 'Untitled Document',
    summary: jsonOutput.summary || 'No summary available',
    key_points: Array.isArray(jsonOutput.key_points) ? jsonOutput.key_points : [],
    quotes: Array.isArray(jsonOutput.quotes) ? jsonOutput.quotes : []
  };
}