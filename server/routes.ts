import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { salomaoEngine } from "./services/salomaoEngine";
import { templateService } from "./services/templateService";
import { githubService } from "./services/githubService";
import monitorRoutes from "./routes/monitor";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize templates
  await templateService.initializeTemplates();

  // Auth middleware
  await setupAuth(app);

  // Monitor routes (public)
  app.use('/api/monitor', monitorRoutes);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/popular', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const templates = await templateService.getPopularTemplates(limit);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching popular templates:", error);
      res.status(500).json({ message: "Failed to fetch popular templates" });
    }
  });

  // Chat routes
  app.post('/api/chat/start', async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? (req.user as any)?.claims?.sub : undefined;
      const session = await salomaoEngine.startChatSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error starting chat session:", error);
      res.status(500).json({ message: "Failed to start chat session" });
    }
  });

  app.post('/api/chat/:sessionId/message', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const result = await salomaoEngine.processMessage(sessionId, message);
      res.json(result);
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.get('/api/chat/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Protected routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user systems
      const systems = await storage.getUserSystems(userId);
      
      // Get recent leads
      const leads = await storage.getUserLeads(userId);
      const todayLeads = leads.filter(lead => {
        const today = new Date();
        const leadDate = lead.createdAt ? new Date(lead.createdAt) : new Date();
        return leadDate.toDateString() === today.toDateString();
      });

      // Calculate metrics
      const totalLeads = leads.length;
      const totalConversions = leads.filter(lead => lead.converted).length;
      const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

      // Calculate projected revenue (simplified)
      const avgTicket = 850; // Average ticket in R$
      const projectedRevenue = totalConversions * avgTicket;

      const metrics = {
        leadsToday: todayLeads.length,
        totalLeads,
        conversionRate: Math.round(conversionRate),
        projectedRevenue: Math.round(projectedRevenue / 1000), // in thousands
        activeSystems: systems.filter(s => s.status === 'active').length,
        averageRating: 4.8 // Mock for now
      };

      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/systems', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const systems = await storage.getUserSystems(userId);
      res.json(systems);
    } catch (error) {
      console.error("Error fetching systems:", error);
      res.status(500).json({ message: "Failed to fetch systems" });
    }
  });

  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getUserLeads(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const leads = await storage.getUserLeads(userId);
      res.json(leads.slice(0, limit));
    } catch (error) {
      console.error("Error fetching recent leads:", error);
      res.status(500).json({ message: "Failed to fetch recent leads" });
    }
  });

  app.post('/api/systems/create-from-chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const system = await salomaoEngine.createSystemFromChat(sessionId, userId);
      res.json(system);
    } catch (error) {
      console.error("Error creating system from chat:", error);
      res.status(500).json({ message: "Failed to create system" });
    }
  });

  // GitHub integration routes
  app.post('/api/github/create-repo', async (req, res) => {
    try {
      const result = await githubService.createRepository();
      res.json(result);
    } catch (error) {
      console.error("Error creating GitHub repo:", error);
      res.status(500).json({ message: "Failed to create repository" });
    }
  });

  app.post('/api/github/upload-files', async (req, res) => {
    try {
      const result = await githubService.uploadProjectFiles();
      res.json(result);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  app.post('/api/github/create-readme', async (req, res) => {
    try {
      const result = await githubService.createREADME();
      res.json(result);
    } catch (error) {
      console.error("Error creating README:", error);
      res.status(500).json({ message: "Failed to create README" });
    }
  });

  app.get('/api/github/repo-info', async (req, res) => {
    try {
      const result = await githubService.getRepositoryInfo();
      res.json(result);
    } catch (error) {
      console.error("Error fetching repo info:", error);
      res.status(500).json({ message: "Failed to fetch repository info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
