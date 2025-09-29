import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, date, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles with roles
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "staff", "accountant"] }).notNull().default("staff"),
  full_name: text("full_name"),
  created_at: timestamp("created_at").defaultNow(),
});

// Jobs tracking
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  customer: text("customer").notNull(),
  service_type: text("service_type").notNull(),
  amount_eur: numeric("amount_eur", { precision: 10, scale: 2 }).notNull(),
  parts_cost_eur: numeric("parts_cost_eur", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status", { enum: ["Pending", "In Progress", "Completed"] }).notNull().default("Pending"),
  tax_applied: boolean("tax_applied").notNull().default(false),
  total_with_tax: numeric("total_with_tax", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Business expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  category: text("category").notNull(), // Fuel, Tools, Insurance, Ads, etc.
  amount_eur: numeric("amount_eur", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Audit logging
export const audit_log = pgTable("audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_email: text("user_email").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  created_at: true,
  updated_at: true,
  total_with_tax: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  created_at: true,
});

export const insertAuditLogSchema = createInsertSchema(audit_log).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type AuditLog = typeof audit_log.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Status and category enums for frontend
export const JOB_STATUSES = ["Pending", "In Progress", "Completed"] as const;
export const USER_ROLES = ["admin", "staff", "accountant"] as const;
export const EXPENSE_CATEGORIES = ["Fuel", "Tools", "Insurance", "Ads", "Office Supplies", "Utilities", "Other"] as const;
