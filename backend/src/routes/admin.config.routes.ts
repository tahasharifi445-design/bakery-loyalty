import { Router } from "express";
import { LoyaltyConfig } from "../models/loyaltyConfig.model";

const router = Router();

// GET /v1/admin/config - Get current loyalty configuration
router.get("/config", async (_req, res) => {
  try {
    const config = await LoyaltyConfig.findOne();

    if (!config) {
      return res.status(404).json({ error: "Loyalty config not found" });
    }

    return res.json({
      pointsPerDollar: Number(config.earn_rate),
    });
  } catch (error) {
    console.error("Failed to fetch loyalty config", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// PUT /v1/admin/config - Update loyalty configuration
router.put("/config", async (req, res) => {
  try {
    const { pointsPerDollar } = req.body ?? {};

    // Validate input type
    if (typeof pointsPerDollar !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Validate pointsPerDollar is positive and reasonable
    if (pointsPerDollar <= 0 || pointsPerDollar > 1000) {
      return res
        .status(400)
        .json({ error: "Points per dollar must be between 0 and 1000" });
    }

    // Find or create config (single-row pattern)
    const [config] = await LoyaltyConfig.findOrCreate({
      where: {},
      defaults: {
        earn_rate: pointsPerDollar,
      },
    });

    // Update the config
    await config.update({ earn_rate: pointsPerDollar });

    return res.json({
      pointsPerDollar: Number(config.earn_rate),
    });
  } catch (error) {
    console.error("Failed to update loyalty config", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as adminConfigRouter };
