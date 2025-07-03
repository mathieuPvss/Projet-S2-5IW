import { Router, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { createUser, findUserByEmail, User } from "../services/user.service";

const router = Router();

// Inscription
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email déjà utilisé" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await createUser(email, hash);
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

// Connexion
router.post("/login", (req: Request, res: Response, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: User, info: { message: any }) => {
      if (err || !user) {
        return res
          .status(401)
          .json({ message: info?.message || "Identifiants invalides" });
      }
      const payload = { sub: user.id, email: user.email, role: user.role };
      const jwtSecret = process.env.JWT_SECRET as Secret;
      const signOptions: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any,
      };
      const refreshOptions: SignOptions = {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as any,
      };
      const accessToken = jwt.sign(payload, jwtSecret, signOptions);
      const refreshToken = jwt.sign(payload, jwtSecret, refreshOptions);
      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      });
    }
  )(req, res, next);
});

// Refresh token
router.post("/refresh", (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token)
    return res.status(400).json({ message: "Refresh token requis" });

  jwt.verify(
    refresh_token,
    process.env.JWT_SECRET as Secret,
    async (err: any, payload: any) => {
      if (err)
        return res.status(401).json({ message: "Refresh token invalide" });
      const user = await findUserByEmail(payload.email);
      if (!user)
        return res.status(401).json({ message: "Utilisateur non trouvé" });

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const jwtSecret = process.env.JWT_SECRET as Secret;
      const signOptions: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any,
      };
      const refreshOptions: SignOptions = {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as any,
      };
      const accessToken = jwt.sign(newPayload, jwtSecret, signOptions);
      const refreshToken = jwt.sign(newPayload, jwtSecret, refreshOptions);

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      });
    }
  );
});

export default router;
