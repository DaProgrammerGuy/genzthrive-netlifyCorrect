import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertSkillProgressSchema, insertIncomeStreamSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new user (auto-registration)
  app.post("/api/users", async (req, res) => {
    try {
      const userId = req.body.userId || crypto.randomUUID();
      const username = `user_${userId.slice(0, 8)}`;
      
      const user = await storage.createUser({
        username,
        password: "auto_generated" // Not used in your current flow
      });
      
      res.json({ userId: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(validatedData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Get user skills
  app.get("/api/skills/:userId", async (req, res) => {
    try {
      const skills = await storage.getUserSkills(req.params.userId);
      res.json(skills || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  // Update skill progress
  app.post("/api/skills", async (req, res) => {
    try {
      const validatedData = insertSkillProgressSchema.parse(req.body);
      const skill = await storage.updateSkillProgress(validatedData);
      res.json(skill);
    } catch (error) {
      res.status(400).json({ message: "Invalid skill data" });
    }
  });

  // Get user income streams
  app.get("/api/income/:userId", async (req, res) => {
    try {
      const streams = await storage.getUserIncomeStreams(req.params.userId);
      res.json(streams || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income streams" });
    }
  });

  // Update income stream
  app.post("/api/income", async (req, res) => {
    try {
      const validatedData = insertIncomeStreamSchema.parse(req.body);
      const stream = await storage.updateIncomeStream(validatedData);
      res.json(stream);
    } catch (error) {
      res.status(400).json({ message: "Invalid income stream data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}