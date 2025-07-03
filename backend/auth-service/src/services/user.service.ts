import { Pool } from "pg";

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
  const res = await pool.query('SELECT * FROM "user" WHERE email = $1', [
    email,
  ]);
  return res.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const res = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function createUser(
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<User> {
  const res = await pool.query(
    'INSERT INTO "user" (email, password, role) VALUES ($1, $2, $3) RETURNING *',
    [email, password, role]
  );
  return res.rows[0];
}
