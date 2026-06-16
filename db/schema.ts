import { pgTable, serial, text, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer("credits").default(1000).notNull(),
  githubToken: text("github_token"),
  plan: text("plan").default("Free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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
  knownIssues: text("known_issues"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").default('running'),
  totalTests: integer("total_tests").default(0),
  passed: integer("passed").default(0),
  failed: integer("failed").default(0),
  durationMs: integer("duration_ms").default(0),
  triggeredBy: text("triggered_by").default('manual'),
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id).notNull(),
  runId: integer("run_id").references(() => testRuns.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"),
  targetRoute: text("target_route"),
  expectedResult: text("expected_result"),
  status: text("status").default('pending'),
  failureType: text("failure_type"),
  rootCause: text("root_cause"),
  suggestedFix: text("suggested_fix"),
  priority: text("priority"),
  tags: json("tags").$type<string[]>(),
  logs: json("logs"),
  sessionId: text("session_id"),
  sessionUrl: text("session_url"),
  script: text("script"),
  wasHealed: boolean("was_healed").default(false).notNull(),
  healedAt: timestamp("healed_at"),
  healCount: integer("heal_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  secret: text("secret").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").references(() => repositories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cronExpression: text("cron_expression").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  slackWebhookUrl: text("slack_webhook_url"),
  notifyOn: text("notify_on").default('all').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  repositories: many(repositories),
  testRuns: many(testRuns),
  webhooks: many(webhooks),
  schedules: many(schedules),
  notificationSettings: one(notificationSettings),
}));

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  testCases: many(testCases),
  testRuns: many(testRuns),
  webhooks: many(webhooks),
  schedules: many(schedules),
}));

export const testRunRelations = relations(testRuns, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [testRuns.repoId],
    references: [repositories.id],
  }),
  testCases: many(testCases),
}));

export const testCaseRelations = relations(testCases, ({ one }) => ({
  repository: one(repositories, {
    fields: [testCases.repoId],
    references: [repositories.id],
  }),
  testRun: one(testRuns, {
    fields: [testCases.runId],
    references: [testRuns.id],
  })
}));
