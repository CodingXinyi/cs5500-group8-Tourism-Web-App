import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a user
router.post("/", async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({
      data: {
        email: email,
        name: name, 
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to create user" });
  }
});

// 获取用户信息
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to get user information" });
  }
});

export default router;
