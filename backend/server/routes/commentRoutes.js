import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a Comment
router.post("/", async (req, res) => {
  try {
    const { userId, postId, comment } = req.body;
    const newComment = await prisma.postComment.create({
      data: {
        userId,
        postId,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        },
        post: true
      }
    });
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to create comment" });
  }
});

// delete comment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.postComment.delete({
      where: {
        id: parseInt(id)
      }
    });
    res.json({ message: "comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to delete comment" });
  }
});

// update comment
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const updatedComment = await prisma.postComment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        comment,
        createdAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      }
    });
    
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to update comment" });
  }
});

// export the router
export default router;