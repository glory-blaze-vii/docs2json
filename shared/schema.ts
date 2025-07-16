import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  jsonOutput: json("json_output"),
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // in seconds
  confidence: text("confidence"),
  outputFilePath: text("output_file_path"), // Path to the saved JSON file
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const updateConversionSchema = createInsertSchema(conversions).partial().omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type UpdateConversion = z.infer<typeof updateConversionSchema>;
