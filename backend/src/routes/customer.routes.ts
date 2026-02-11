import { Router } from "express";
import { Customer } from "../models/customer.model";
import { normalizePhone } from "../utils/phone";

const router = Router();

router.post("/lookup", async (req, res) => {
  try {
    const { phone } = req.body ?? {};

    if (typeof phone !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch (error) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    const customer = await Customer.findOne({
      where: { phone_number: normalizedPhone },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.json({
      id: customer.id,
      name: customer.name,
      phone_number: customer.phone_number,
      points_balance: customer.points_balance,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    });
  } catch (error) {
    console.error("Customer lookup failed", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body ?? {};

    if (typeof phone !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (name !== undefined && name !== null && typeof name !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch (error) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    const existingCustomer = await Customer.findOne({
      where: { phone_number: normalizedPhone },
    });

    if (existingCustomer) {
      return res.status(409).json({ error: "Customer already exists" });
    }

    const customer = await Customer.create({
      name: name ?? null,
      phone_number: normalizedPhone,
    });

    return res.status(201).json({
      id: customer.id,
      name: customer.name,
      phone_number: customer.phone_number,
      points_balance: customer.points_balance,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    });
  } catch (error) {
    console.error("Customer creation failed", error);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { router as customerRouter };
