import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a Post
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.get("/", async (req, res) => {
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
router.get("/:id", async (req, res) => {
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

// Get all comments for a specific post
router.get("/:postId/comments", async (req, res) => {
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

// delete post
router.delete("/:id", async (req, res) => {
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

// export the router
export default router;