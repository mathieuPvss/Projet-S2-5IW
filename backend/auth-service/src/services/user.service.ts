import { Pool } from "pg";
import {
  incrementDatabaseOperation,
  recordDatabaseDuration,
} from "./metrics.service";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export interface User {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  verified: boolean;
  passwordExpiresAt?: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const startTime = Date.now();
  try {
    const res = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("findUserByEmail", "user", duration);
    incrementDatabaseOperation("findUserByEmail", "user", "success");
    return res.rows[0] || null;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("findUserByEmail", "user", duration);
    incrementDatabaseOperation("findUserByEmail", "user", "error");
    throw error;
  }
}

export async function checkPasswordExpiry(user: User): Promise<boolean> {
  // Si pas de date d'expiration définie, considérer comme expiré
  if (!user.passwordExpiresAt) {
    return true;
  }

  const expiryDate = new Date(user.passwordExpiresAt);
  return expiryDate < new Date();
}

export async function sendPasswordResetRequest(email: string): Promise<void> {
  try {
    // Appel au service query-forge-dev pour déclencher l'envoi de l'email
    const nestBaseUrl = process.env.NEST_BASE_URL || "http://nestjs:3000";
    console.log('Envoi de la requête de réinitialisation du mot de passe à:', nestBaseUrl);
    const response = await fetch(
      `${nestBaseUrl}/api/users/request-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      console.error(
        "Erreur lors de l'envoi de l'email de reset:",
        response.statusText
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'appel au service de reset password:",
      error
    );
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const startTime = Date.now();
  try {
    const res = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("findUserById", "user", duration);
    incrementDatabaseOperation("findUserById", "user", "success");
    return res.rows[0] || null;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("findUserById", "user", duration);
    incrementDatabaseOperation("findUserById", "user", "error");
    throw error;
  }
}

export async function createUser(
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<User> {
  const startTime = Date.now();
  try {
    const res = await pool.query(
      'INSERT INTO "user" (email, password, role, verified, "resetPasswordToken", "resetPasswordExpires", "passwordExpiresAt") VALUES ($1, $2, $3, $4, null, null, $5) RETURNING *',
      [email, password, role, false, new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)]
    );
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("createUser", "user", duration);
    incrementDatabaseOperation("createUser", "user", "success");
    return res.rows[0];
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("createUser", "user", duration);
    incrementDatabaseOperation("createUser", "user", "error");
    throw error;
  }
}

export async function verifyUser(email: string): Promise<User | null> {
  const startTime = Date.now();
  try {
    const res = await pool.query(
      'UPDATE "user" SET verified = true WHERE email = $1 RETURNING *',
      [email]
    );
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("verifyUser", "user", duration);
    incrementDatabaseOperation("verifyUser", "user", "success");
    return res.rows[0] || null;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseDuration("verifyUser", "user", duration);
    incrementDatabaseOperation("verifyUser", "user", "error");
    throw error;
  }
}
