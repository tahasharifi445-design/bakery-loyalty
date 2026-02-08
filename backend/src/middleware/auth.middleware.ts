import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express";

const isValidRole = (role: string): role is AuthUser["role"] =>
  role === "staff" || role === "admin";

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    const sub = typeof payload.sub === "string" ? payload.sub : undefined;
    const role = typeof payload.role === "string" ? payload.role : undefined;
    const name = typeof payload.name === "string" ? payload.name : undefined;

    if (!sub || !role || !isValidRole(role)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { sub, role, name };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (roles: AuthUser["role"][]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
