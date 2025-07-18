import { Router, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  User,
  verifyUser,
  checkPasswordExpiry,
  sendPasswordResetRequest,
} from "../services/user.service";
import { sendConfirmationEmail } from "../services/email.service";
import {
  incrementAuthOperation,
  recordAuthDuration,
  incrementAuthFailure,
  incrementRegisteredUser,
  recordPasswordHashing,
  setActiveTokens,
} from "../services/metrics.service";

const router = Router();

// Inscription
router.post("/register", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      incrementAuthFailure("register", "missing_credentials");
      incrementAuthOperation("register", "error", "POST");
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      incrementAuthFailure("register", "email_already_exists");
      incrementAuthOperation("register", "error", "POST");
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hashStart = Date.now();
    const hash = await bcrypt.hash(password, 10);
    const hashDuration = (Date.now() - hashStart) / 1000;
    recordPasswordHashing(hashDuration);

    const user = await createUser(email, hash);

    // Générer token de confirmation
    const confirmationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as Secret,
      { expiresIn: "24h" }
    );

    // Envoyer email de confirmation
    try {
      await sendConfirmationEmail(user.email, confirmationToken);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      // On continue même si l'email échoue
    }

    const duration = (Date.now() - startTime) / 1000;
    recordAuthDuration("register", "POST", duration);
    incrementAuthOperation("register", "success", "POST");
    incrementRegisteredUser(user.role);

    res.status(201).json({
      message:
        "Inscription réussie. Vérifiez votre email pour confirmer votre compte.",
      id: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
    });
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordAuthDuration("register", "POST", duration);
    incrementAuthOperation("register", "error", "POST");
    incrementAuthFailure("register", "internal_error");
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Confirmation d'email
router.get("/confirm", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    try {
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET as Secret
      ) as { email: string };

      const user = await findUserByEmail(decoded.email);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      if (user.verified) {
        return res.status(200).json({ message: "Compte déjà confirmé" });
      }

      const verifiedUser = await verifyUser(decoded.email);

      res.status(200).json({
        message:
          "Email confirmé avec succès. Vous pouvez maintenant vous connecter.",
        verified: true,
      });
    } catch (jwtError) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }
  } catch (error) {
    console.error("Erreur lors de la confirmation:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Connexion
router.post("/login", (req: Request, res: Response, next) => {
  const startTime = Date.now();
  passport.authenticate(
    "local",
    { session: false },
    async (err: any, user: User, info: { message: any }) => {
      const duration = (Date.now() - startTime) / 1000;

      if (err || !user) {
        recordAuthDuration("login", "POST", duration);
        incrementAuthOperation("login", "error", "POST");
        incrementAuthFailure("login", "invalid_credentials");
        return res
          .status(401)
          .json({ message: info?.message || "Identifiants invalides" });
      }

      // Vérifier si l'utilisateur a confirmé son email
      if (!user.verified && user.role === "user") {
        recordAuthDuration("login", "POST", duration);
        incrementAuthOperation("login", "error", "POST");
        incrementAuthFailure("login", "email_not_verified");
        return res.status(403).json({
          message: "Veuillez confirmer votre email avant de vous connecter",
        });
      }

      // Vérifier si le mot de passe est expiré pour les users classique
      if (user.role === "user") {
        const isPasswordExpired = await checkPasswordExpiry(user);
        if (isPasswordExpired) {
          // Envoyer l'email de reset password de manière asynchrone
          sendPasswordResetRequest(user.email).catch((error) => {
            console.error("Erreur lors de l'envoi de l'email de reset:", error);
          });

          recordAuthDuration("login", "POST", duration);
          incrementAuthOperation("login", "error", "POST");
          incrementAuthFailure("login", "password_expired");
          return res.status(403).json({
            message:
              "Votre mot de passe a expiré. Un email de réinitialisation a été envoyé.",
            passwordExpired: true,
          });
        }
      }

      try {
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

        recordAuthDuration("login", "POST", duration);
        incrementAuthOperation("login", "success", "POST");
        setActiveTokens("access", 1);
        setActiveTokens("refresh", 1);

        res.json({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            verified: user.verified,
          },
        });
      } catch (tokenError) {
        recordAuthDuration("login", "POST", duration);
        incrementAuthOperation("login", "error", "POST");
        incrementAuthFailure("login", "token_generation_error");
        console.error("Erreur lors de la génération des tokens:", tokenError);
        res.status(500).json({ message: "Erreur interne du serveur" });
      }
    }
  )(req, res, next);
});

// Refresh token
router.post("/refresh", (req: Request, res: Response) => {
  const startTime = Date.now();
  const { refresh_token } = req.body;

  if (!refresh_token) {
    const duration = (Date.now() - startTime) / 1000;
    recordAuthDuration("refresh", "POST", duration);
    incrementAuthOperation("refresh", "error", "POST");
    incrementAuthFailure("refresh", "missing_token");
    return res.status(400).json({ message: "Refresh token requis" });
  }

  jwt.verify(
    refresh_token,
    process.env.JWT_SECRET as Secret,
    async (err: any, payload: any) => {
      const duration = (Date.now() - startTime) / 1000;

      if (err) {
        recordAuthDuration("refresh", "POST", duration);
        incrementAuthOperation("refresh", "error", "POST");
        incrementAuthFailure("refresh", "invalid_token");
        return res.status(401).json({ message: "Refresh token invalide" });
      }

      try {
        const user = await findUserByEmail(payload.email);
        if (!user) {
          recordAuthDuration("refresh", "POST", duration);
          incrementAuthOperation("refresh", "error", "POST");
          incrementAuthFailure("refresh", "user_not_found");
          return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        const newPayload = { sub: user.id, email: user.email, role: user.role };
        const jwtSecret = process.env.JWT_SECRET as Secret;
        const signOptions: SignOptions = {
          expiresIn: (process.env.JWT_EXPIRES_IN || "45m") as any,
        };
        const refreshOptions: SignOptions = {
          expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as any,
        };
        const accessToken = jwt.sign(newPayload, jwtSecret, signOptions);
        const refreshToken = jwt.sign(newPayload, jwtSecret, refreshOptions);

        recordAuthDuration("refresh", "POST", duration);
        incrementAuthOperation("refresh", "success", "POST");
        setActiveTokens("access", 1);
        setActiveTokens("refresh", 1);

        res.json({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: { id: user.id, email: user.email, role: user.role },
        });
      } catch (error) {
        recordAuthDuration("refresh", "POST", duration);
        incrementAuthOperation("refresh", "error", "POST");
        incrementAuthFailure("refresh", "internal_error");
        console.error("Erreur lors du refresh:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
      }
    }
  );
});

export default router;
