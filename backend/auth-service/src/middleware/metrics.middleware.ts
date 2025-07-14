import { Request, Response, NextFunction } from "express";
import {
  incrementHttpRequest,
  recordHttpDuration,
} from "../services/metrics.service";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const route = req.route?.path || req.path || "unknown";
  const cleanRoute = route.replace(/\/:\w+/g, "/:id");

  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();

    incrementHttpRequest(req.method, cleanRoute, statusCode);
    recordHttpDuration(req.method, cleanRoute, duration);
  });

  next();
}
