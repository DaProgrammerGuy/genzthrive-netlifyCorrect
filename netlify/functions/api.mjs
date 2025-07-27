var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/functions/api.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  incomeStreams: () => incomeStreams,
  insertIncomeStreamSchema: () => insertIncomeStreamSchema,
  insertSkillProgressSchema: () => insertSkillProgressSchema,
  insertUserProgressSchema: () => insertUserProgressSchema,
  insertUserSchema: () => insertUserSchema,
  skillProgress: () => skillProgress,
  userProgress: () => userProgress,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phase: integer("phase").notNull(),
  // 1-4 for the roadmap phases
  progress: integer("progress").notNull().default(0),
  // 0-100 percentage
  completedTasks: jsonb("completed_tasks").default([]),
  // Array of completed task IDs
  updatedAt: timestamp("updated_at").defaultNow()
});
var skillProgress = pgTable("skill_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillCategory: text("skill_category").notNull(),
  // technical, business, ai
  skillName: text("skill_name").notNull(),
  level: integer("level").notNull().default(0),
  // 0-100 percentage
  updatedAt: timestamp("updated_at").defaultNow()
});
var incomeStreams = pgTable("income_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  streamType: text("stream_type").notNull(),
  // saas, freelancing, digital_products, consulting
  isActive: integer("is_active").notNull().default(0),
  // 0 or 1 (boolean)
  monthlyRevenue: integer("monthly_revenue").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true
});
var insertSkillProgressSchema = createInsertSchema(skillProgress).omit({
  id: true,
  updatedAt: true
});
var insertIncomeStreamSchema = createInsertSchema(incomeStreams).omit({
  id: true,
  updatedAt: true
});

// netlify/functions/api.ts
import { eq, and } from "drizzle-orm";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getUserProgress(userId) {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  async updateUserProgress(progress) {
    const [existingProgress] = await db.select().from(userProgress).where(and(eq(userProgress.userId, progress.userId), eq(userProgress.phase, progress.phase)));
    if (existingProgress) {
      const [updatedProgress] = await db.update(userProgress).set({ progress: progress.progress, completedTasks: progress.completedTasks }).where(eq(userProgress.id, existingProgress.id)).returning();
      return updatedProgress;
    } else {
      const [newProgress] = await db.insert(userProgress).values(progress).returning();
      return newProgress;
    }
  }
  async getUserSkills(userId) {
    return await db.select().from(skillProgress).where(eq(skillProgress.userId, userId));
  }
  async updateSkillProgress(skill) {
    const [existingSkill] = await db.select().from(skillProgress).where(and(eq(skillProgress.userId, skill.userId), eq(skillProgress.skillName, skill.skillName)));
    if (existingSkill) {
      const [updatedSkill] = await db.update(skillProgress).set({ level: skill.level }).where(eq(skillProgress.id, existingSkill.id)).returning();
      return updatedSkill;
    } else {
      const [newSkill] = await db.insert(skillProgress).values(skill).returning();
      return newSkill;
    }
  }
  async getUserIncomeStreams(userId) {
    return await db.select().from(incomeStreams).where(eq(incomeStreams.userId, userId));
  }
  async updateIncomeStream(stream) {
    const [existingStream] = await db.select().from(incomeStreams).where(and(eq(incomeStreams.userId, stream.userId), eq(incomeStreams.streamType, stream.streamType)));
    if (existingStream) {
      const [updatedStream] = await db.update(incomeStreams).set({ isActive: stream.isActive, monthlyRevenue: stream.monthlyRevenue }).where(eq(incomeStreams.id, existingStream.id)).returning();
      return updatedStream;
    } else {
      const [newStream] = await db.insert(incomeStreams).values(stream).returning();
      return newStream;
    }
  }
};
var storage = new DatabaseStorage();
var parseBody = (event) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
};
var handler = async (event, context) => {
  const { httpMethod, path } = event;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  try {
    const apiPath = event.path.replace("/.netlify/functions/api", "") || "/";
    const pathSegments = apiPath.split("/").filter(Boolean);
    if (httpMethod === "GET" && pathSegments[0] === "progress" && pathSegments[1]) {
      const userId = pathSegments[1];
      const progress = await storage.getUserProgress(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress || [])
      };
    }
    if (httpMethod === "POST" && pathSegments[0] === "progress") {
      const body = parseBody(event);
      const validatedData = insertUserProgressSchema.parse(body);
      const progress = await storage.updateUserProgress(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress)
      };
    }
    if (httpMethod === "GET" && pathSegments[0] === "skills" && pathSegments[1]) {
      const userId = pathSegments[1];
      const skills = await storage.getUserSkills(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(skills || [])
      };
    }
    if (httpMethod === "POST" && pathSegments[0] === "skills") {
      const body = parseBody(event);
      const validatedData = insertSkillProgressSchema.parse(body);
      const skill = await storage.updateSkillProgress(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(skill)
      };
    }
    if (httpMethod === "GET" && pathSegments[0] === "income" && pathSegments[1]) {
      const userId = pathSegments[1];
      const streams = await storage.getUserIncomeStreams(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(streams || [])
      };
    }
    if (httpMethod === "POST" && pathSegments[0] === "income") {
      const body = parseBody(event);
      const validatedData = insertIncomeStreamSchema.parse(body);
      const stream = await storage.updateIncomeStream(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stream)
      };
    }
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Route not found" })
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    };
  }
};
export {
  handler
};
