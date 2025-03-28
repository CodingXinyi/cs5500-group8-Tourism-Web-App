import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a rating
router.post('/', async (req, res) => {
    const { userId, postId, rating } = req.body;
    try {
        const newRating = await prisma.postRating.create({
            data: { userId, postId, rating }
        });
        res.json(newRating);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read all ratings
router.get('/', async (req, res) => {
    try {
        const ratings = await prisma.postRating.findMany();
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read all ratings for a specific post by postId
router.get('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const ratings = await prisma.postRating.findMany({
            where: { postId: Number(postId) }
        });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a rating based on userId and postId (composite primary key)
router.put('/', async (req, res) => {
    const { userId, postId, rating } = req.body;
    try {
        const updatedRating = await prisma.postRating.update({
            where: { userId_postId: { userId: Number(userId), postId: Number(postId) } },
            data: { rating }
        });

        res.json(updatedRating);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a rating based on userId and postId (composite primary key)
router.delete('/', async (req, res) => {
    const { userId, postId } = req.body;
    try {
        await prisma.postRating.delete({
            where: { userId_postId: { userId: Number(userId), postId: Number(postId) } }
        });

        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


export default router;
