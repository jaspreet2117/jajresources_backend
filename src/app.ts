import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./utils/errorHandler";
import dotenv from "dotenv";

dotenv.config();

const app = express();
  app.use(cors({
    origin:["process.env.FRONTEND_URL", 
        "https://jajresources.vercel.app",
     "https://www.jajresources.com",
    "https://jajresources.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  }))
app.use(express.json());

app.use("/api/images", imageRoutes);

app.use(errorHandler);

export default app;
