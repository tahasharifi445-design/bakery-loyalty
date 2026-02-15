import { Router } from "express";
import { StaffUser } from "../models/staffUser.model";

const router = Router();

// GET /v1/admin/staff - List all staff users
router.get("/staff", async (_req, res) => {
  try {
    const staffUsers = await StaffUser.findAll({
      attributes: ["id", "name", "role", "is_active", "created_at"],
      order: [["created_at", "DESC"]],
    });

    const users = staffUsers.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));

    return res.json({ users });
  } catch (error) {
    console.error("Failed to fetch staff users", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// PATCH /v1/admin/staff/:id/active - Toggle staff user active status
router.patch("/staff/:id/active", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    // Validate input
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Find staff user
    const staffUser = await StaffUser.findByPk(id);
    if (!staffUser) {
      return res.status(404).json({ error: "Staff user not found" });
    }

    // Prevent deactivating self
    if (req.user?.sub === id && !isActive) {
      return res
        .status(400)
        .json({ error: "Cannot deactivate your own account" });
    }

    // Update active status
    await staffUser.update({ is_active: isActive });

    return res.json({
      id: staffUser.id,
      name: staffUser.name,
      role: staffUser.role,
      isActive: staffUser.is_active,
    });
  } catch (error) {
    console.error("Failed to toggle staff user active status", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as adminStaffRouter };
