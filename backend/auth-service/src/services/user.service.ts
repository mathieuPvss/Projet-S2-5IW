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
      'INSERT INTO "user" (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password, role]
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
