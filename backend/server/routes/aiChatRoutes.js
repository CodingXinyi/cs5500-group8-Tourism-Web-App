import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// create a new chat session
router.post("/session", async (req, res) => {
  try {
    const { userId } = req.body;
    
    const session = await prisma.aiChatSession.create({
      data: {
        userId: parseInt(userId),
      }
    });
    
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "create session failed" });
  }
});

// send message to AI and save conversation record
router.post("/message", async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    // save user message
    await prisma.aiChatMessage.create({
      data: {
        sessionId: parseInt(sessionId),
        userId: parseInt(userId),
        role: 'user',
        content: message
      }
    });
    
    // call AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });
    
    const responseData = await response.json();
    const aiReply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || 'request failed, please try it later';
    
    // save AI reply
    const savedMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: parseInt(sessionId),
        userId: parseInt(userId),
        role: 'assistant',
        content: aiReply
      }
    });
    
    res.json(savedMessage);
  } catch (error) {
    console.error("request failed:", error);
    res.status(500).json({ error: "request failed, please try it later" });
  }
});

// get all messages of a specific session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const messages = await prisma.aiChatMessage.findMany({
      where: {
        sessionId: parseInt(sessionId)
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "get messages failed" });
  }
});

export default router; 