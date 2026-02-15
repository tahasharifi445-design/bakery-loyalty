import { Router } from "express";
import { sequelize } from "../db";
import { Customer } from "../models/customer.model";
import { Transaction } from "../models/transaction.model";
import { LoyaltyConfig } from "../models/loyaltyConfig.model";

const router = Router();

router.post("/purchase", async (req, res) => {
  try {
    const { customerId, purchaseAmount } = req.body ?? {};

    // Validate input types
    if (typeof customerId !== "string" || typeof purchaseAmount !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Validate purchase amount
    if (purchaseAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
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

      // 2. Read loyalty config to get points per dollar
      const loyaltyConfig = await LoyaltyConfig.findOne({ transaction: t });
      if (!loyaltyConfig) {
        throw new Error("LOYALTY_CONFIG_NOT_FOUND");
      }

      const pointsPerDollar = Number(loyaltyConfig.earn_rate);

      // 3. Calculate points awarded (floor to get integer)
      const pointsAwarded = Math.floor(purchaseAmount * pointsPerDollar);

      // 4. Create transaction record
      const transaction = await Transaction.create(
        {
          customer_id: customerId,
          staff_user_id: staffUserId,
          amount: purchaseAmount,
          points_earned: pointsAwarded,
        },
        { transaction: t }
      );

      // 5. Update customer points balance atomically
      const newBalance = customer.points_balance + pointsAwarded;
      await customer.update({ points_balance: newBalance }, { transaction: t });

      return {
        transactionId: transaction.id,
        pointsAwarded,
        newBalance,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("Purchase transaction failed", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "CUSTOMER_NOT_FOUND") {
        return res.status(404).json({ error: "Customer not found" });
      }
      if (error.message === "LOYALTY_CONFIG_NOT_FOUND") {
        return res
          .status(500)
          .json({ error: "Server misconfigured: loyalty config not found" });
      }
    }

    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as transactionRouter };
