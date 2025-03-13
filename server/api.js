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
    const { email, name, preferredName } = req.body;
    const tweet = await prisma.user.create({
      data: {
        email : email,
        name : name, 
        preferredName : preferredName
      },
    });
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user." });
  }
});


app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

// Prisma Commands
// npx prisma db push: to push the schema to the database or any changes to the schema
// npx prisma studio: to open prisma studio and visualize the database
