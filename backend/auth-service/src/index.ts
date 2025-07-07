import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from "./routes/auth";
import { configurePassport } from "./passport";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
