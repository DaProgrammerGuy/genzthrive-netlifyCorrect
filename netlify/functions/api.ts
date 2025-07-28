import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { 
  users, 
  userProgress, 
  skillProgress, 
  incomeStreams,
  insertUserProgressSchema,
  insertSkillProgressSchema,
  insertIncomeStreamSchema,
  type User,
  type UserProgress,
  type SkillProgress,
  type IncomeStream,
  type InsertUser,
  type InsertUserProgress,
  type InsertSkillProgress,
  type InsertIncomeStream
} from '../../shared/schema';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Simple UUID v4 generator for Netlify compatibility
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Database storage class
class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [existingProgress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, progress.userId), eq(userProgress.phase, progress.phase)));

    if (existingProgress) {
      const [updatedProgress] = await db
        .update(userProgress)
        .set({ progress: progress.progress, completedTasks: progress.completedTasks })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updatedProgress;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values(progress)
        .returning();
      return newProgress;
    }
  }

  async getUserSkills(userId: string): Promise<SkillProgress[]> {
    return await db.select().from(skillProgress).where(eq(skillProgress.userId, userId));
  }

  async updateSkillProgress(skill: InsertSkillProgress): Promise<SkillProgress> {
    const [existingSkill] = await db
      .select()
      .from(skillProgress)
      .where(and(eq(skillProgress.userId, skill.userId), eq(skillProgress.skillName, skill.skillName)));

    if (existingSkill) {
      const [updatedSkill] = await db
        .update(skillProgress)
        .set({ level: skill.level })
        .where(eq(skillProgress.id, existingSkill.id))
        .returning();
      return updatedSkill;
    } else {
      const [newSkill] = await db
        .insert(skillProgress)
        .values(skill)
        .returning();
      return newSkill;
    }
  }

  async getUserIncomeStreams(userId: string): Promise<IncomeStream[]> {
    return await db.select().from(incomeStreams).where(eq(incomeStreams.userId, userId));
  }

  async updateIncomeStream(stream: InsertIncomeStream): Promise<IncomeStream> {
    const [existingStream] = await db
      .select()
      .from(incomeStreams)
      .where(and(eq(incomeStreams.userId, stream.userId), eq(incomeStreams.streamType, stream.streamType)));

    if (existingStream) {
      const [updatedStream] = await db
        .update(incomeStreams)
        .set({ isActive: stream.isActive, monthlyRevenue: stream.monthlyRevenue })
        .where(eq(incomeStreams.id, existingStream.id))
        .returning();
      return updatedStream;
    } else {
      const [newStream] = await db
        .insert(incomeStreams)
        .values(stream)
        .returning();
      return newStream;
    }
  }
}

const storage = new DatabaseStorage();

// Helper function to parse request body
const parseBody = (event: HandlerEvent) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
};

// Main handler function
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, path } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Extract the API path from the Netlify function path
    const apiPath = event.path.replace('/.netlify/functions/api', '') || '/';
    const pathSegments = apiPath.split('/').filter(Boolean);

    // Route handling
    
    // Create user endpoint
    if (httpMethod === 'POST' && pathSegments[0] === 'users') {
      const body = parseBody(event);
      const userId = body.userId || generateUUID();
      const username = `user_${userId.slice(0, 8)}`;
      
      try {
        const user = await storage.createUser({
          username,
          password: "auto_generated"
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ userId: user.id, username: user.username }),
        };
      } catch (error) {
        // User might already exist, try to find them
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ userId: existingUser.id, username: existingUser.username }),
          };
        }
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Failed to create user', error: error instanceof Error ? error.message : 'Unknown error' }),
        };
      }
    }

    

    if (httpMethod === 'GET' && pathSegments[0] === 'progress' && pathSegments[1]) {
      const userId = pathSegments[1];
      const progress = await storage.getUserProgress(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress || []),
      };
    }

    if (httpMethod === 'POST' && pathSegments[0] === 'progress') {
      const body = parseBody(event);
      const validatedData = insertUserProgressSchema.parse(body);
      const progress = await storage.updateUserProgress(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress),
      };
    }

    if (httpMethod === 'GET' && pathSegments[0] === 'skills' && pathSegments[1]) {
      const userId = pathSegments[1];
      const skills = await storage.getUserSkills(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(skills || []),
      };
    }

    if (httpMethod === 'POST' && pathSegments[0] === 'skills') {
      const body = parseBody(event);
      const validatedData = insertSkillProgressSchema.parse(body);
      const skill = await storage.updateSkillProgress(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(skill),
      };
    }

    if (httpMethod === 'GET' && pathSegments[0] === 'income' && pathSegments[1]) {
      const userId = pathSegments[1];
      const streams = await storage.getUserIncomeStreams(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(streams || []),
      };
    }

    if (httpMethod === 'POST' && pathSegments[0] === 'income') {
      const body = parseBody(event);
      const validatedData = insertIncomeStreamSchema.parse(body);
      const stream = await storage.updateIncomeStream(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stream),
      };
    }

    // Route not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};