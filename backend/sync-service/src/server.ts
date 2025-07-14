import express from "express";
import { getMetrics } from "./services/metrics.service";

const app = express();
const PORT = process.env.SYNC_PORT || 3333;

// Route pour les métriques Prometheus
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques:", error);
    res.status(500).send("Erreur serveur");
  }
});

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export const startMetricsServer = () => {
  return new Promise<void>((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Serveur de métriques démarré sur le port ${PORT}`);
      console.log(
        `Métriques disponibles sur: http://localhost:${PORT}/metrics`
      );
      resolve();
    });

    // Gestion propre de l'arrêt
    process.on("SIGTERM", () => {
      console.log("Arrêt du serveur de métriques...");
      server.close(() => {
        console.log("Serveur de métriques arrêté");
        process.exit(0);
      });
    });
  });
};
