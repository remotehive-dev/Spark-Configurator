import { sql, eq } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Topics table
export const topics = pgTable("topics", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: text("name").notNull(),
  grade: text("grade"),
  category: text("category"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTopicSchema = z.object({
  name: z.string().min(1).max(256),
  grade: z.string().optional(),
  category: z.string().optional(),
});
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

// Students table (minimal fields used by admin panel)
export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  grade: text("grade"),
  status: text("status"),
  board: text("board"),
  sapEligible: boolean("sap_eligible").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertStudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grade: z.string().optional(),
  status: z.string().optional(),
  board: z.string().optional(),
  sapEligible: z.boolean().optional(),
});
export type StudentRow = typeof students.$inferSelect;
export type InsertStudentRow = z.infer<typeof insertStudentSchema>;

// Curriculum files
export const curriculumFiles = pgTable("curriculum_files", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  topic: text("topic"),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCurriculumFileSchema = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  topic: z.string().optional(),
  url: z.string().url(),
});
export type CurriculumFile = typeof curriculumFiles.$inferSelect;
export type InsertCurriculumFile = z.infer<typeof insertCurriculumFileSchema>;

// Customizations per student
export const customizations = pgTable("customizations", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  studentId: varchar("student_id").notNull(),
  selectedTopics: jsonb("selected_topics").$type<string[]>().notNull(),
  parentTopics: jsonb("parent_topics").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCustomizationSchema = z.object({
  studentId: z.string().min(1),
  selectedTopics: z.array(z.string()).min(1),
  parentTopics: z.array(z.string()).default([]),
});
export type Customization = typeof customizations.$inferSelect;
export type InsertCustomization = z.infer<typeof insertCustomizationSchema>;
