import { Router } from "express";
import { Reward } from "../models/reward.model";

const router = Router();

// POST /v1/admin/rewards - Create new reward
router.post("/rewards", async (req, res) => {
  try {
    const { name, requiredPoints } = req.body ?? {};

    // Validate input types
    if (typeof name !== "string" || typeof requiredPoints !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Validate name is not empty
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({ error: "Reward name is required" });
    }

    // Validate requiredPoints is positive
    if (requiredPoints <= 0) {
      return res
        .status(400)
        .json({ error: "Required points must be greater than 0" });
    }

    // Create reward
    const reward = await Reward.create({
      name: trimmedName,
      points_cost: requiredPoints,
      is_active: true,
    });

    return res.status(201).json({
      id: reward.id,
      name: reward.name,
      pointsCost: reward.points_cost,
      isActive: reward.is_active,
    });
  } catch (error) {
    console.error("Failed to create reward", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// PUT /v1/admin/rewards/:id - Update reward
router.put("/rewards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, requiredPoints } = req.body ?? {};

    // Find reward
    const reward = await Reward.findByPk(id);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    // Validate input if provided
    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({ error: "Invalid name" });
      }
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: "Reward name is required" });
      }
    }

    if (requiredPoints !== undefined) {
      if (typeof requiredPoints !== "number" || requiredPoints <= 0) {
        return res
          .status(400)
          .json({ error: "Required points must be greater than 0" });
      }
    }

    // Update reward
    const updateData: Partial<{ name: string; points_cost: number }> = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (requiredPoints !== undefined) {
      updateData.points_cost = requiredPoints;
    }

    await reward.update(updateData);

    return res.json({
      id: reward.id,
      name: reward.name,
      pointsCost: reward.points_cost,
      isActive: reward.is_active,
    });
  } catch (error) {
    console.error("Failed to update reward", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// PATCH /v1/admin/rewards/:id/active - Toggle reward active status
router.patch("/rewards/:id/active", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    // Validate input
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Find reward
    const reward = await Reward.findByPk(id);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    // Update active status
    await reward.update({ is_active: isActive });

    return res.json({
      id: reward.id,
      name: reward.name,
      pointsCost: reward.points_cost,
      isActive: reward.is_active,
    });
  } catch (error) {
    console.error("Failed to toggle reward active status", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as adminRewardsRouter };
