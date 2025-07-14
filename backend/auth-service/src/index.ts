import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from "./routes/auth";
import { configurePassport } from "./passport";
import { metricsMiddleware } from "./middleware/metrics.middleware";
import { getMetrics } from "./services/metrics.service";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de métriques (avant les autres routes)
app.use(metricsMiddleware);

configurePassport();
app.use(passport.initialize());

app.use("/auth", authRoutes);

// Route pour les métriques Prometheus
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
