import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer("credits").default(1000).notNull(),
  githubToken: text("github_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repoId: text("repo_id").notNull(),
  fullName: text("full_name").notNull(),
  htmlUrl: text("html_url"),
  description: text("description"),
  language: text("language"),
  defaultBranch: text("default_branch"),
  targetDomain: text("target_domain"),
  globalInstruction: text("global_instruction"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"),
  targetRoute: text("target_route"),
  expectedResult: text("expected_result"),
  status: text("status").default('pending'),
  logs: json("logs"),
  sessionId: text("session_id"),
  sessionUrl: text("session_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repositoryRelations = relations(repositories, ({ many }) => ({
  testCases: many(testCases),
}));

export const testCaseRelations = relations(testCases, ({ one }) => ({
  repository: one(repositories, {
    fields: [testCases.repoId],
    references: [repositories.id],
  }),
}));
