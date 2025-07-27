#!/usr/bin/env node

// Seed script for Netlify deployment
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './shared/schema.js';
import { users, userProgress, skillProgress, incomeStreams } from './shared/schema.js';
import { eq } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seedDatabase() {
  console.log('🌱 Seeding database for Netlify deployment...');

  try {
    // Check if demo user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'demo_user'));

    let demoUserId;
    
    if (existingUser) {
      console.log('Demo user already exists, skipping seed...');
      demoUserId = existingUser.id;
    } else {
      console.log('Creating demo user...');
      const [newUser] = await db
        .insert(users)
        .values({
          username: 'demo_user',
          email: 'demo@example.com'
        })
        .returning();
      demoUserId = newUser.id;
    }

    // Seed initial progress data
    const progressData = [
      {
        userId: demoUserId,
        phase: 'foundation',
        progress: 75,
        completedTasks: ['market-research', 'skill-assessment', 'goal-setting']
      },
      {
        userId: demoUserId,
        phase: 'integration',
        progress: 45,
        completedTasks: ['online-presence', 'networking']
      },
      {
        userId: demoUserId,
        phase: 'expansion',
        progress: 20,
        completedTasks: ['team-building']
      },
      {
        userId: demoUserId,
        phase: 'pivot-scale',
        progress: 5,
        completedTasks: []
      }
    ];

    // Insert progress data (skip if exists)
    for (const progress of progressData) {
      const [existing] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, demoUserId) && eq(userProgress.phase, progress.phase));
      
      if (!existing) {
        await db.insert(userProgress).values(progress);
      }
    }

    // Seed skills data
    const skillsData = [
      { userId: demoUserId, skillName: 'JavaScript', level: 85 },
      { userId: demoUserId, skillName: 'React', level: 80 },
      { userId: demoUserId, skillName: 'Node.js', level: 75 },
      { userId: demoUserId, skillName: 'Business Strategy', level: 65 },
      { userId: demoUserId, skillName: 'Marketing', level: 70 },
      { userId: demoUserId, skillName: 'Financial Planning', level: 60 },
      { userId: demoUserId, skillName: 'AI/ML Basics', level: 55 },
      { userId: demoUserId, skillName: 'Prompt Engineering', level: 70 },
      { userId: demoUserId, skillName: 'AI Tools', level: 65 }
    ];

    for (const skill of skillsData) {
      const [existing] = await db
        .select()
        .from(skillProgress)
        .where(eq(skillProgress.userId, demoUserId) && eq(skillProgress.skillName, skill.skillName));
      
      if (!existing) {
        await db.insert(skillProgress).values(skill);
      }
    }

    // Seed income streams data
    const incomeData = [
      {
        userId: demoUserId,
        streamType: 'micro-saas',
        isActive: false,
        monthlyRevenue: 0
      },
      {
        userId: demoUserId,
        streamType: 'freelancing',
        isActive: true,
        monthlyRevenue: 1500
      },
      {
        userId: demoUserId,
        streamType: 'digital-products',
        isActive: false,
        monthlyRevenue: 0
      },
      {
        userId: demoUserId,
        streamType: 'consulting',
        isActive: false,
        monthlyRevenue: 0
      }
    ];

    for (const income of incomeData) {
      const [existing] = await db
        .select()
        .from(incomeStreams)
        .where(eq(incomeStreams.userId, demoUserId) && eq(incomeStreams.streamType, income.streamType));
      
      if (!existing) {
        await db.insert(incomeStreams).values(income);
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`👤 Demo user ID: ${demoUserId}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase();