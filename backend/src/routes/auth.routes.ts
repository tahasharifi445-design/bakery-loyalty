import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Sequelize } from "sequelize";
import { StaffUser } from "../models/staffUser.model";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const isValidPin = (pin: string): boolean => /^\d{4,10}$/.test(pin);

router.post("/login", async (req, res) => {
  try {
    const { name, pin } = req.body ?? {};

    if (typeof name !== "string" || typeof pin !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    const normalizedName = name.trim();

    if (!normalizedName || !isValidPin(pin)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const staffUser = await StaffUser.findOne({
      where: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("name")),
        normalizedName.toLowerCase()
      ),
    });

    if (!staffUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!staffUser.is_active) {
      return res.status(403).json({ error: "User inactive" });
    }

    const pinMatches = await bcrypt.compare(pin, staffUser.pin_hash);

    if (!pinMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "12h") as jwt.SignOptions[
      "expiresIn"
    ];
    const token = jwt.sign(
      {
        sub: staffUser.id,
        role: staffUser.role,
        name: staffUser.name,
      },
      jwtSecret,
      { expiresIn }
    );

    return res.json({
      token,
      user: {
        id: staffUser.id,
        name: staffUser.name,
        role: staffUser.role,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

router.get("/health", (_req, res) => {
  return res.json({ ok: true, service: "auth" });
});

export { router as authRouter };
