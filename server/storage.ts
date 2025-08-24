import {
  users,
  systems,
  leads,
  templates,
  chatSessions,
  type User,
  type UpsertUser,
  type System,
  type InsertSystem,
  type Lead,
  type InsertLead,
  type Template,
  type InsertTemplate,
  type ChatSession,
  type InsertChatSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // System operations
  createSystem(system: InsertSystem): Promise<System>;
  getUserSystems(userId: string): Promise<System[]>;
  getSystem(id: string): Promise<System | undefined>;
  updateSystem(id: string, updates: Partial<System>): Promise<System>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getSystemLeads(systemId: string): Promise<Lead[]>;
  getUserLeads(userId: string): Promise<Lead[]>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // System operations
  async createSystem(system: InsertSystem): Promise<System> {
    const [newSystem] = await db.insert(systems).values(system).returning();
    return newSystem;
  }

  async getUserSystems(userId: string): Promise<System[]> {
    return await db
      .select()
      .from(systems)
      .where(eq(systems.userId, userId))
      .orderBy(desc(systems.createdAt));
  }

  async getSystem(id: string): Promise<System | undefined> {
    const [system] = await db.select().from(systems).where(eq(systems.id, id));
    return system;
  }

  async updateSystem(id: string, updates: Partial<System>): Promise<System> {
    const [updatedSystem] = await db
      .update(systems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(systems.id, id))
      .returning();
    return updatedSystem;
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async getSystemLeads(systemId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.systemId, systemId))
      .orderBy(desc(leads.createdAt));
  }

  async getUserLeads(userId: string): Promise<Lead[]> {
    return await db
      .select({
        id: leads.id,
        systemId: leads.systemId,
        data: leads.data,
        status: leads.status,
        converted: leads.converted,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .innerJoin(systems, eq(leads.systemId, systems.id))
      .where(eq(systems.userId, userId))
      .orderBy(desc(leads.createdAt));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.usageCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  // Chat session operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }
}

export const storage = new DatabaseStorage();
