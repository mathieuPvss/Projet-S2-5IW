import { Request, Response, NextFunction } from "express";
import {
  incrementHttpRequest,
  recordHttpDuration,
} from "../metrics.service.mts";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Capture la route (nettoie pour éviter les IDs dynamiques)
  const route = req.route?.path || req.path || "unknown";
  const cleanRoute = route
    .replace(/\/[a-f0-9-]{36}/g, "/:uuid") // UUIDs
    .replace(/\/[a-zA-Z0-9_-]+(?=\/|$)/g, "/:id"); // IDs génériques

  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();

    // Incrémenter le compteur de requêtes
    incrementHttpRequest(req.method, cleanRoute, statusCode);

    // Enregistrer la durée
    recordHttpDuration(req.method, cleanRoute, duration);
  });

  next();
}
