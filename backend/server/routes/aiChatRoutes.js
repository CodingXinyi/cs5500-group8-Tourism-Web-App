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
    let prompt = `请根据以下数据库信息回答用户问题。用户问题: ${message}\n\n`;
    
    if (Object.keys(contextData).length > 0) {
      prompt += "数据库信息:\n" + JSON.stringify(contextData, null, 2) + "\n\n";
    } else {
      prompt += "没有找到与问题相关的数据库信息。请尽量根据一般知识回答。\n\n";
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
    const aiReply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || '请求失败，请稍后再试';
    
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
    console.error("请求失败:", error);
    res.status(500).json({ error: "请求失败，请稍后再试" });
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