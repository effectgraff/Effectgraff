import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, leadNotes, leadTasks, leads, Lead, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listLeads() {
  const db = await getDb();
  if (!db) return [] as Lead[];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function createLead(input: Omit<typeof leads.$inferInsert, "id" | "createdAt" | "updatedAt" | "consentAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(leads).values({ ...input, consentAt: new Date() });
  return { id: Number(result[0].insertId) };
}

export async function updateLeadStatus(id: number, status: "new" | "qualified" | "proposal" | "won" | "lost", nextFollowUpAt?: Date | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(leads).set({ status, nextFollowUpAt: nextFollowUpAt ?? null }).where(eq(leads.id, id));
}

export async function listLeadNotes(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadNotes).where(eq(leadNotes.leadId, leadId)).orderBy(desc(leadNotes.createdAt));
}

export async function addLeadNote(input: { leadId: number; authorId: number; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(leadNotes).values(input);
}

export async function listLeadTasks(leadId?: number) {
  const db = await getDb();
  if (!db) return [];
  return leadId === undefined
    ? db.select().from(leadTasks).orderBy(desc(leadTasks.createdAt))
    : db.select().from(leadTasks).where(eq(leadTasks.leadId, leadId)).orderBy(desc(leadTasks.createdAt));
}

export async function createLeadTask(input: { leadId: number; title: string; dueAt?: Date | null; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(leadTasks).values({ ...input, dueAt: input.dueAt ?? null });
  return { id: Number(result[0].insertId) };
}

export async function toggleLeadTask(id: number, status: "open" | "done") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(leadTasks).set({ status }).where(eq(leadTasks.id, id));
}
