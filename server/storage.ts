import { conversions, users, type User, type InsertUser, type Conversion, type InsertConversion, type UpdateConversion } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversion methods
  getAllConversions(): Promise<Conversion[]>;
  getConversion(id: number): Promise<Conversion | undefined>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  updateConversion(id: number, updates: UpdateConversion): Promise<Conversion>;
  deleteConversion(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversions: Map<number, Conversion>;
  private currentUserId: number;
  private currentConversionId: number;

  constructor() {
    this.users = new Map();
    this.conversions = new Map();
    this.currentUserId = 1;
    this.currentConversionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllConversions(): Promise<Conversion[]> {
    return Array.from(this.conversions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getConversion(id: number): Promise<Conversion | undefined> {
    return this.conversions.get(id);
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = this.currentConversionId++;
    const conversion: Conversion = {
      ...insertConversion,
      id,
      status: insertConversion.status || "pending",
      jsonOutput: insertConversion.jsonOutput || null,
      errorMessage: insertConversion.errorMessage || null,
      processingTime: insertConversion.processingTime || null,
      confidence: insertConversion.confidence || null,
      outputFilePath: insertConversion.outputFilePath || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async updateConversion(id: number, updates: UpdateConversion): Promise<Conversion> {
    const existing = this.conversions.get(id);
    if (!existing) {
      throw new Error(`Conversion with id ${id} not found`);
    }

    const updated: Conversion = { ...existing, ...updates };
    this.conversions.set(id, updated);
    return updated;
  }

  async deleteConversion(id: number): Promise<void> {
    this.conversions.delete(id);
  }
}

export const storage = new MemStorage();
