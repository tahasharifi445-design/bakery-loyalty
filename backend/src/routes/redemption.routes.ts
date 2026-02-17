import { Router } from "express";
import { sequelize } from "../db";
import { Customer } from "../models/customer.model";
import { Reward } from "../models/reward.model";
import { Redemption } from "../models/redemption.model";

const router = Router();

// GET /v1/rewards - List active rewards (or all rewards if includeInactive=true)
router.get("/rewards", async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";

    const whereClause = includeInactive ? {} : { is_active: true };

    const rewards = await Reward.findAll({
      where: whereClause,
      order: [["points_cost", "ASC"]],
    });

    const formattedRewards = rewards.map((r) => ({
      id: r.id,
      name: r.name,
      pointsCost: r.points_cost,
      isActive: r.is_active,
    }));

    return res.json({ rewards: formattedRewards });
  } catch (error) {
    console.error("Failed to fetch rewards", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// POST /v1/redemptions - Redeem a reward
router.post("/redemptions", async (req, res) => {
  try {
    const { customerId, rewardId } = req.body ?? {};

    // Validate input types
    if (typeof customerId !== "string" || typeof rewardId !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Get staff user ID from authenticated user
    const staffUserId = req.user?.sub;
    if (!staffUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Start Sequelize transaction for atomicity
    const result = await sequelize.transaction(async (t) => {
      // 1. Fetch customer
      const customer = await Customer.findByPk(customerId, { transaction: t });
      if (!customer) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      // 2. Fetch reward
      const reward = await Reward.findByPk(rewardId, { transaction: t });
      if (!reward) {
        throw new Error("REWARD_NOT_FOUND");
      }

      // 3. Check if customer has enough points
      if (customer.points_balance < reward.points_cost) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // 4. Create redemption record
      const redemption = await Redemption.create(
        {
          customer_id: customerId,
          reward_id: rewardId,
          staff_user_id: staffUserId,
          points_spent: reward.points_cost,
        },
        { transaction: t }
      );

      // 5. Update customer points balance atomically
      const newBalance = customer.points_balance - reward.points_cost;
      await customer.update({ points_balance: newBalance }, { transaction: t });

      return {
        redemptionId: redemption.id,
        pointsDeducted: reward.points_cost,
        newBalance,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("Redemption transaction failed", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "CUSTOMER_NOT_FOUND") {
        return res.status(404).json({ error: "Customer not found" });
      }
      if (error.message === "REWARD_NOT_FOUND") {
        return res.status(404).json({ error: "Reward not found" });
      }
      if (error.message === "INSUFFICIENT_POINTS") {
        return res.status(409).json({ error: "Insufficient points" });
      }
    }

    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as redemptionRouter };
