import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import { CronService } from "./services/CronService";
import { userRouter } from "./routes/users";
import quoteRouter from "./routes/quotes";
import authRouter from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/quotes", quoteRouter);

// Add health check endpoint
app.get("/api/health", (_, res) => {
  res.status(200).json({ status: "healthy" });
});

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    
    // Start the cron jobs
    const cronService = new CronService();
    cronService.startDailyEmailJobs();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  }); 