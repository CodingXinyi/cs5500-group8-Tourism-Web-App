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
    console.error("Failed to create session");
    res.status(500).json({ error: "Failed to create session" });
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
    
    // query database for related information
    let contextData = {};
    
    // get post information
    if (message.toLowerCase().includes("post") || 
        message.toLowerCase().includes("帖子") || 
        message.toLowerCase().includes("地点")) {
      const posts = await prisma.post.findMany({
        include: {
          user: {
            select: {
              username: true,
              name: true
            }
          },
          comments: true,
          ratings: true
        }
      });
      contextData.posts = posts;
    }
    
    // get comment information
    if (message.toLowerCase().includes("comment") || 
        message.toLowerCase().includes("评论")) {
      const comments = await prisma.postComment.findMany({
        include: {
          user: {
            select: {
              username: true
            }
          },
          post: {
            select: {
              postName: true
            }
          }
        }
      });
      contextData.comments = comments;
    }
    
    // get rating information
    if (message.toLowerCase().includes("rating") || 
        message.toLowerCase().includes("评分") || 
        message.toLowerCase().includes("评价")) {
      const ratings = await prisma.postRating.findMany({
        include: {
          user: {
            select: {
              username: true
            }
          },
          post: {
            select: {
              postName: true,
              averageRating: true
            }
          }
        }
      });
      contextData.ratings = ratings;
    }
    
    // build prompt to send to AI, including context data
    let prompt = `Please answer the user's question based on the following database information. User question: ${message}\n\n`;
    
    if (Object.keys(contextData).length > 0) {
      prompt += "Database information:\n" + JSON.stringify(contextData, null, 2) + "\n\n";
    } else {
      prompt += "No relevant database information found. Please answer based on general knowledge.\n\n";
    }
    
    // call AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const responseData = await response.json();
    const aiReply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Request failed, please try it later';
    
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
    console.error("Request failure:", error);
    res.status(500).json({ error: "Request failed, please try again" });  
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
    console.error("Failed to get messages");
    res.status(500).json({ error: "Failed to get messages" });
  }
});

export default router; 