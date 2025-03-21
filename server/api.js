import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// ==== put your endpoints below ====

// Create a Tweet Item
app.post("/user", async (req, res) => {
  try {
    const { email, name} = req.body;
    const tweet = await prisma.user.create({
      data: {
        email : email,
        name : name, 
        // preferredName : preferredName
      },
    });
    res.json(tweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// Create a Post
app.post("/posts", async (req, res) => {
  try {
    const { 
      userId, 
      postName, 
      locationState, 
      locationCity, 
      exactLocation, 
      postDetailDescription, 
      pictureUrl 
    } = req.body;
    
    const newPost = await prisma.post.create({
      data: {
        userId,
        postName,
        locationState,
        locationCity,
        exactLocation,
        postDetailDescription,
        pictureUrl
      },
      include: {
        user: true
      }
    });
    res.json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "创建帖子失败" });
  }
});

// Create a Comment
app.post("/comments", async (req, res) => {
  try {
    const { userId, postId, comment } = req.body;
    const newComment = await prisma.postComment.create({
      data: {
        userId,
        postId,
        comment
      },
      include: {
        user: true,
        post: true
      }
    });
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to create comment" });
  }
});

// Get all comments for a specific post
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await prisma.postComment.findMany({
      where: {
        postId: parseInt(postId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to get comments" });
  }
});

// delete comment
app.delete("/comments/:id", async (req, res) => {
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
app.put("/comments/:id", async (req, res) => {
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
            email: true
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

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

// Prisma Commands
// npx prisma db push: to push the schema to the database or any changes to the schema
// npx prisma studio: to open prisma studio and visualize the database
