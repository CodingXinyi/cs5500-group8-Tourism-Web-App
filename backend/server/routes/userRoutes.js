import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a user
router.post("/", async (req, res) => {
  try {
    const { email, name, username, password } = req.body;
    
    // check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      return res.status(400).json({ error: "username already exists" });
    }

    // check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return res.status(400).json({ error: "email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password, // note: should encrypt password in actual use
      },
    });
    
    // exclude password when returning user information
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to create user" });
  }
});

// get user information
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        posts: true,
        ratings: true,
        comments: true,
        // do not return password field
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

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({ error: "user does not exist" });
    }

    // verify password
    if (user.password !== password) { // note: should use encryption to compare in actual use
      return res.status(400).json({ error: "password is incorrect" });
    }

    // exclude password when returning user information
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login failed" });  
  }
});

export default router;
