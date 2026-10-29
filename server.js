
import express from "express";
import cors from "cors";
import "./config/env.js";
import connectDB from "./config/db.js";
import registerRoutes from "./src/routes/index.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

const configuredClientOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => {
        try {
            return new URL(value.trim()).origin;
        } catch {
            return null;
        }
    })
    .filter(Boolean);

const allowedOrigins = [...new Set([
    ...configuredClientOrigins,
    "https://linkme-k4qb.onrender.com",
    "http://localhost:5173",
])];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.get("/", (_req, res) => {
    res.json({ success: true, message: "LinkMe API is running", health: "/api/health" });
});
app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "LinkMe API is running" });
});

// Register API routes
registerRoutes(app);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`✅ LinkMe Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start LinkMe server:", error);
        process.exit(1);
    }
};

startServer();
