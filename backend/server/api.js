import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";

//import routes
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// mount the routes
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/rating", ratingRoutes);
app.use("/aiChat", aiChatRoutes);


// conditionally start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log("Server running on http://localhost: ${PORT} 🎉 🚀");
  });
}

// export app object for testing
export default app;

// Prisma Commands
// npx prisma db push: to push the schema to the database or any changes to the schema
// npx prisma studio: to open prisma studio and visualize the database
