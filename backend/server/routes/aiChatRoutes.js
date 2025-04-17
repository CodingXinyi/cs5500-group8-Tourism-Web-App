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
    
    // 验证必要参数
    if (!sessionId || !userId || !message) {
      return res.status(400).json({ error: "Missing required fields: sessionId, userId, and message are required" });
    }
    
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
    
    // 获取历史对话内容提供上下文
    const previousMessages = await prisma.aiChatMessage.findMany({
      where: {
        sessionId: parseInt(sessionId)
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // 获取最近5条消息
    });

    // 构建对话历史
    let conversationHistory = "";
    if (previousMessages.length > 0) {
      conversationHistory = "Previous conversation:\n";
      // 逆序排列，最旧的消息在前
      for (const msg of [...previousMessages].reverse()) {
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      }
    }
    
    // 更复杂的语义分析函数
    function analyzeUserIntent(message) {
      const lowerMessage = message.toLowerCase();
      const intents = {
        post: ['post', 'destination', 'place', 'location', '地点', '帖子', '目的地', '旅游点', '景点'],
        comment: ['comment', 'feedback', '评论', '留言', '反馈'],
        rating: ['rating', 'score', 'stars', '评分', '评价', '打分', '星级'],
        user: ['user', 'account', 'profile', '用户', '账户', '个人资料'],
        // 添加更多意图类别
      };
      
      const detectedIntents = {};
      
      for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          detectedIntents[intent] = true;
        }
      }
      
      return detectedIntents;
    }

    // 替换现有的关键词检测
    // query database for related information
    let contextData = {};
    const userIntent = analyzeUserIntent(message);

    if (userIntent.post) {
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
    
    if (userIntent.comment) {
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
    
    if (userIntent.rating) {
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
    
    // 在prompt中添加对话历史
    let prompt = `You are a helpful assistant for a tourism blog system. Please provide a clear and concise response to the user's question based on the following database information and previous conversation. When listing items, use commas for separation instead of bullets or asterisks. Keep the response friendly and professional.

${conversationHistory}

Database context:
{database_info}

User question: ${message}

Remember to:
1. Format lists with commas instead of bullets
2. Keep responses concise and relevant
3. If no relevant information is found, politely indicate that
4. Use natural, conversational language
5. Respond in the same language as the user's question (English or Chinese)
`;
    
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
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,      // 降低创造性，增加精确性
          topP: 0.85,            // 控制多样性
          topK: 40,              // 控制多样性
          maxOutputTokens: 1024  // 允许更长回复以确保完整性
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
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