import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  wallSize: varchar("wallSize", { length: 160 }).notNull(),
  budget: varchar("budget", { length: 160 }).notNull(),
  projectType: varchar("projectType", { length: 160 }),
  timing: varchar("timing", { length: 160 }),
  details: text("details"),
  language: varchar("language", { length: 8 }).default("ru").notNull(),
  source: varchar("source", { length: 80 }).default("website_brief").notNull(),
  status: mysqlEnum("status", ["new", "qualified", "proposal", "won", "lost"]).default("new").notNull(),
  assignedTo: int("assignedTo"),
  nextFollowUpAt: timestamp("nextFollowUpAt"),
  consentAt: timestamp("consentAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leadTasks = mysqlTable("leadTasks", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  dueAt: timestamp("dueAt"),
  status: mysqlEnum("status", ["open", "done"]).default("open").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leadNotes = mysqlTable("leadNotes", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  authorId: int("authorId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type LeadTask = typeof leadTasks.$inferSelect;
export type LeadNote = typeof leadNotes.$inferSelect;
