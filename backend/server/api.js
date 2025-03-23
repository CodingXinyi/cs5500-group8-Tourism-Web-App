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
      },
    });
    res.json(tweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// get user information
app.get("/user/:id", async (req, res) => {
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
    res.status(500).json({ error: "failed to create post" });
  }
});

// Update a post 
app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    updateData.updatedAt = new Date();
    
    const updatedPost = await prisma.post.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
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
    
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to update post" });
  }
});

// get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          select: {
            id: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // calculate the comment count for each post
    const postsWithCounts = posts.map(post => {
      return {
        ...post,
        commentCount: post.comments.length,
        comments: undefined // remove the comment details, only keep the count
      };
    });
    
    res.json(postsWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to get post list" });
  }
});

// get post details
app.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
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
        },
        ratings: {
          select: {
            rating: true,
            userId: true
          }
        }
      }
    });
    
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    
    // calculate the average rating
    let averageRating = 0;
    if (post.ratings.length > 0) {
      const sum = post.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / post.ratings.length;
    }
    
    const postWithRating = {
      ...post,
      averageRating,
      ratingCount: post.ratings.length
    };
    
    res.json(postWithRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to get post details" });
  }
});

// delete post
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({
      where: {
        id: parseInt(id)
      }
    });
    res.json({ message: "帖子删除成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "删除帖子失败" });
  }
});

/** Comment **/
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

// conditionally start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(8000, () => {
    console.log("Server running on http://localhost:8000 🎉 🚀");
  });
}

// export app object for testing
export default app;

// Prisma Commands
// npx prisma db push: to push the schema to the database or any changes to the schema
// npx prisma studio: to open prisma studio and visualize the database
